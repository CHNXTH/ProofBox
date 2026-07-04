import { loadActiveSession, clearActiveSession, loadUserMemory } from "../../utils/evidenceStore.js";
import { evidenceCompleteness, getMissingRequiredSteps } from "../../utils/flowPresets.js";
import { summarizeSession, generateAfterSalesMessage, buildModelPrompt } from "../../utils/summary.js";
import { showToast, speak } from "../../utils/device.js";

export default {
  data: {
    session: null,
    completeness: 0,
    missingText: "无",
    summary: "",
    afterSalesMessage: "",
    abnormalCount: 0,
    evidenceCount: 0,
    snCount: 0,
    modelPrompt: ""
  },

  onLoad() {
    const session = loadActiveSession();
    if (!session) {
      this.setData({
        summary: "暂无开箱记录。请返回首页开始一次新的开箱取证流程。",
        afterSalesMessage: "",
        missingText: "暂无"
      });
      return;
    }

    const memory = loadUserMemory();
    const summary = session.summary || summarizeSession(session);
    const afterSalesMessage = session.afterSalesMessage || generateAfterSalesMessage(session, memory);
    const evidenceCount = session.steps.reduce((sum, step) => sum + (step.evidenceCount || 0), 0);
    const missing = getMissingRequiredSteps(session);

    this.setData({
      session,
      completeness: evidenceCompleteness(session),
      missingText: missing.length ? missing.join("、") : "无",
      summary,
      afterSalesMessage,
      abnormalCount: session.abnormalities.length,
      evidenceCount,
      snCount: session.snRecords.length,
      modelPrompt: buildModelPrompt(session, memory)
    });
  },

  onShow() {
    speak("总结已生成，可在手机端查看。");
  },

  copySummary() {
    this.copyText(this.data.summary, "开箱总结已复制");
  },

  copyAfterSales() {
    this.copyText(this.data.afterSalesMessage, "售后说明已复制");
  },

  copyPrompt() {
    this.copyText(this.data.modelPrompt, "工作流提示词已复制");
  },

  copyText(text, title) {
    if (typeof wx !== "undefined" && wx && typeof wx.setClipboardData === "function") {
      wx.setClipboardData({
        data: text || "",
        success() {
          showToast(title);
        }
      });
      return;
    }
    console.log("[copy]", text);
    showToast(title);
  },

  restart() {
    clearActiveSession();
    wx.reLaunch({ url: "/pages/index/index" });
  },

  backToFlow() {
    wx.redirectTo({ url: "/pages/flow/index" });
  },

  onKeyUp(event) {
    if (event.code === "Backspace") {
      event.preventDefault();
      this.restart();
    }
    if (event.code === "Enter" || event.code === "GlobalHook") {
      this.copyAfterSales();
    }
  }
};
