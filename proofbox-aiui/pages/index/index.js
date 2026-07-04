import { CATEGORY_OPTIONS, createSession } from "../../utils/flowPresets.js";
import { saveActiveSession, loadUserMemory, updateUserMemory } from "../../utils/evidenceStore.js";
import { showToast, speak, normalizeVoiceCommand } from "../../utils/device.js";

export default {
  data: {
    categories: CATEGORY_OPTIONS,
    selectedId: "phone",
    selectedName: "手机",
    selectedSubtitle: "IMEI/SN、激活状态、配件",
    memory: {},
    wakeHint: "说“我要拆一台手机”或轻点确认",
    status: "ready"
  },

  onLoad(query = {}) {
    const memory = loadUserMemory();
    const selectedId = query.category || memory.preferredCategory || "phone";
    this.selectCategoryById(selectedId, false);
    this.setData({ memory });
  },

  onShow() {
    speak("开箱有证已打开，请选择商品类型。");
  },

  selectCategory(event) {
    const id = event.currentTarget.dataset.id;
    this.selectCategoryById(id, true);
  },

  selectCategoryById(id, announce) {
    const option = CATEGORY_OPTIONS.find((item) => item.id === id) || CATEGORY_OPTIONS[0];
    this.setData({
      selectedId: option.id,
      selectedName: option.name,
      selectedSubtitle: option.subtitle
    });
    if (announce) speak(`已选择${option.name}`);
  },

  startFlow() {
    const session = createSession(this.data.selectedId);
    saveActiveSession(session);
    updateUserMemory({ preferredCategory: this.data.selectedId });
    showToast("流程已开始");
    speak(`开始${session.categoryName}开箱取证。请先遮挡隐私后拍面单。`);
    wx.navigateTo({
      url: `/pages/flow/index?category=${session.categoryId}`
    });
  },

  startQuickPhone() {
    this.selectCategoryById("phone", false);
    this.startFlow();
  },

  onKeyUp(event) {
    if (event.code === "Enter" || event.code === "GlobalHook") {
      this.startFlow();
      return;
    }
    if (event.code === "ArrowUp" || event.code === "ArrowDown") {
      const currentIndex = CATEGORY_OPTIONS.findIndex((item) => item.id === this.data.selectedId);
      const offset = event.code === "ArrowDown" ? 1 : -1;
      const nextIndex = (currentIndex + offset + CATEGORY_OPTIONS.length) % CATEGORY_OPTIONS.length;
      this.selectCategoryById(CATEGORY_OPTIONS[nextIndex].id, true);
    }
  },

  onVoiceWakeup(event) {
    const text = event.keyword || event.text || event.transcript || "";
    this.handleVoiceText(text);
  },

  handleVoiceText(text) {
    const lower = String(text || "").toLowerCase();
    if (/电脑|笔记本|macbook|laptop/.test(lower)) this.selectCategoryById("computer", true);
    if (/潮玩|手办|盲盒/.test(lower)) this.selectCategoryById("collectible", true);
    if (/大件|家具|家电/.test(lower)) this.selectCategoryById("bulky", true);
    if (/手机|iphone|安卓|平板/.test(lower)) this.selectCategoryById("phone", true);

    const command = normalizeVoiceCommand(text);
    if (command === "next" || command === "capture" || /拆|开箱|验/.test(lower)) {
      this.startFlow();
    }
  }
};
