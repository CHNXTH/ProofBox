import {
  createSession,
  getCurrentStep,
  countCompleted,
  evidenceCompleteness
} from "../../utils/flowPresets.js";
import {
  saveActiveSession,
  loadActiveSession,
  archiveSession,
  loadUserMemory
} from "../../utils/evidenceStore.js";
import {
  createCameraContextSafe,
  capturePhoto,
  detectBarcodeFromImage,
  normalizeVoiceCommand,
  showToast,
  speak
} from "../../utils/device.js";
import { summarizeSession, generateAfterSalesMessage } from "../../utils/summary.js";

const ABNORMAL_OPTIONS = [
  { id: "package_damage", name: "外箱破损" },
  { id: "seal_issue", name: "封条异常" },
  { id: "scratch", name: "划痕磕碰" },
  { id: "missing_accessory", name: "配件缺失" },
  { id: "sn_mismatch", name: "编码不一致" },
  { id: "other", name: "其他异常" }
];

export default {
  data: {
    session: null,
    step: null,
    progressText: "0/0",
    completeness: 0,
    selectedAbnormal: "package_damage",
    packageDamageClass: "active",
    sealIssueClass: "",
    scratchClass: "",
    missingAccessoryClass: "",
    snMismatchClass: "",
    otherAbnormalClass: "",
    abnormalNote: "",
    manualCode: "",
    listening: false,
    statusText: "准备中",
    commandHint: "语音：拍照 / 重拍 / 标记异常 / 下一步",
    supplementMode: false,
    cameraReady: false,
    cameraStatusText: "模拟/等待相机",
    stepStatusClass: "",
    isCodeStep: false
  },

  onLoad(query = {}) {
    let session = loadActiveSession();
    if (!session) {
      session = createSession(query.category || "phone");
      saveActiveSession(session);
    }
    this.cameraContext = null;
    this.syncSession(session, "请按当前提示拍照");
  },

  onReady() {
    this.cameraContext = createCameraContextSafe();
    const cameraReady = !!this.cameraContext;
    this.setData({
      cameraReady,
      cameraStatusText: cameraReady ? "相机就绪" : "模拟/等待相机"
    });
  },

  onShow() {
    const step = this.data.step;
    if (step) speak(step.instruction);
  },

  syncSession(session, statusText) {
    const step = getCurrentStep(session);
    this.setData({
      session,
      step,
      progressText: `${Math.min(session.currentIndex + 1, session.steps.length)}/${session.steps.length}`,
      completeness: evidenceCompleteness(session),
      statusText: statusText || this.data.statusText,
      supplementMode: !!(step && step.abnormal),
      stepStatusClass: step && step.abnormal ? "abnormal" : "",
      isCodeStep: !!(step && step.type === "code")
    });
    saveActiveSession(session);
  },

  async captureCurrent() {
    const session = this.data.session;
    const step = getCurrentStep(session);
    if (!step) return;

    this.setData({ statusText: "正在记录..." });
    const photo = await capturePhoto(this.cameraContext, step.id);
    this.addEvidenceToStep(step.id, photo, "已记录");
    speak("已记录");
  },

  retakeCurrent() {
    const session = this.data.session;
    const step = getCurrentStep(session);
    if (!step) return;

    step.photos = [];
    step.evidenceCount = 0;
    step.status = "pending";
    step.notes = [...(step.notes || []), "用户选择重拍"];
    this.syncSession(session, "已清空当前步骤，请重拍");
    speak("请重新对准目标");
  },

  addEvidenceToStep(stepId, evidence, statusText) {
    const session = this.data.session;
    const step = session.steps.find((item) => item.id === stepId);
    if (!step) return;

    step.photos = [...(step.photos || []), evidence];
    step.evidenceCount = (step.evidenceCount || 0) + 1;
    step.status = "done";
    step.updatedAt = new Date().toISOString();
    this.syncSession(session, statusText || "已记录");
  },

  nextStep() {
    const session = this.data.session;
    const step = getCurrentStep(session);
    if (!step) return;

    if (step.status === "pending") {
      step.status = step.required ? "done" : "skipped";
      step.notes = [...(step.notes || []), "用户确认完成"];
    }

    if (session.currentIndex < session.steps.length - 1) {
      session.currentIndex += 1;
      const next = getCurrentStep(session);
      this.syncSession(session, "进入下一步");
      speak(next.instruction);
      return;
    }

    this.finishFlow();
  },

  previousStep() {
    const session = this.data.session;
    if (session.currentIndex > 0) {
      session.currentIndex -= 1;
      this.syncSession(session, "返回上一步");
      speak(getCurrentStep(session).instruction);
    }
  },

  selectAbnormal(event) {
    const dataset = (event.currentTarget && event.currentTarget.dataset) || (event.target && event.target.dataset) || {};
    const selectedAbnormal = dataset.id || "package_damage";
    this.setData({
      selectedAbnormal,
      packageDamageClass: selectedAbnormal === "package_damage" ? "active" : "",
      sealIssueClass: selectedAbnormal === "seal_issue" ? "active" : "",
      scratchClass: selectedAbnormal === "scratch" ? "active" : "",
      missingAccessoryClass: selectedAbnormal === "missing_accessory" ? "active" : "",
      snMismatchClass: selectedAbnormal === "sn_mismatch" ? "active" : "",
      otherAbnormalClass: selectedAbnormal === "other" ? "active" : ""
    });
  },

  onAbnormalNoteInput(event) {
    this.setData({ abnormalNote: event.detail.value });
  },

  markAbnormal() {
    const session = this.data.session;
    const step = getCurrentStep(session);
    if (!step) return;

    const label = this.data.selectedAbnormal;
    const option = ABNORMAL_OPTIONS.find((item) => item.id === label) || ABNORMAL_OPTIONS[0];
    const abnormal = {
      id: `abnormal-${Date.now()}`,
      stepId: step.id,
      stepTitle: step.shortTitle || step.title,
      label,
      labelName: option.name,
      description: this.data.abnormalNote || "",
      createdAt: new Date().toISOString()
    };

    step.abnormal = true;
    step.status = "done";
    step.notes = [...(step.notes || []), `异常：${option.name}${this.data.abnormalNote ? `，${this.data.abnormalNote}` : ""}`];
    session.abnormalities = [...session.abnormalities, abnormal];

    this.setData({ abnormalNote: "", supplementMode: true });
    this.syncSession(session, "已标记异常，请补拍整体 + 近景 + 参照物");
    speak("已标记异常，请补拍整体、近景和参照物。");
  },

  async captureSupplement() {
    const session = this.data.session;
    const step = getCurrentStep(session);
    if (!step) return;

    const photo = await capturePhoto(this.cameraContext, `${step.id}-supplement`);
    photo.supplement = true;
    this.addEvidenceToStep(step.id, photo, "异常补拍已记录");
  },

  onManualCodeInput(event) {
    this.setData({ manualCode: event.detail.value });
  },

  async recordCode() {
    const session = this.data.session;
    const step = getCurrentStep(session);
    if (!step) return;

    let value = String(this.data.manualCode || "").trim();
    let source = "manual";

    if (!value) {
      const photo = await capturePhoto(this.cameraContext, `${step.id}-code`);
      const detected = await detectBarcodeFromImage(photo.path);
      value = detected.value || `待人工核对-${Date.now()}`;
      source = detected.source;
      step.photos = [...(step.photos || []), photo];
      step.evidenceCount = (step.evidenceCount || 0) + 1;
    }

    const record = {
      id: `sn-${Date.now()}`,
      stepId: step.id,
      value,
      source,
      scope: "current_step",
      createdAt: new Date().toISOString()
    };

    step.codes = [...(step.codes || []), record];
    step.status = "done";
    session.snRecords = [...(session.snRecords || []), record];

    this.setData({ manualCode: "" });
    this.syncSession(session, "编码已记录");
    speak("编码已记录");
  },

  skipOptional() {
    const session = this.data.session;
    const step = getCurrentStep(session);
    if (!step) return;

    step.status = step.required ? "done" : "skipped";
    step.notes = [...(step.notes || []), step.required ? "用户确认完成" : "用户跳过可选步骤"];
    this.nextStep();
  },

  finishFlow() {
    const session = this.data.session;
    const memory = loadUserMemory();
    session.summary = summarizeSession(session);
    session.afterSalesMessage = generateAfterSalesMessage(session, memory);
    session.finishedAt = new Date().toISOString();
    saveActiveSession(session);
    archiveSession(session);
    speak("开箱完成，总结已生成。");
    wx.redirectTo({ url: "/pages/summary/index" });
  },

  onKeyUp(event) {
    switch (event.code) {
      case "GlobalHook":
      case "Enter":
        this.captureCurrent();
        break;
      case "ArrowDown":
        this.nextStep();
        break;
      case "ArrowUp":
        this.previousStep();
        break;
      case "Backspace":
        event.preventDefault();
        this.previousStep();
        break;
      default:
        break;
    }
  },

  onVoiceWakeup(event) {
    const text = event.keyword || event.text || event.transcript || "";
    this.handleVoiceText(text);
  },

  handleVoiceText(text) {
    const command = normalizeVoiceCommand(text);
    if (command === "capture") this.captureCurrent();
    if (command === "retake") this.retakeCurrent();
    if (command === "abnormal") this.markAbnormal();
    if (command === "record_code") this.recordCode();
    if (command === "summary") this.finishFlow();
    if (command === "next") this.nextStep();
    if (command === "exit") this.finishFlow();
    if (command === "note") {
      const session = this.data.session;
      const step = getCurrentStep(session);
      if (step) {
        step.notes = [...(step.notes || []), text];
        session.userNotes = [...(session.userNotes || []), text];
        this.syncSession(session, "备注已记录");
      }
    }
  }
};
