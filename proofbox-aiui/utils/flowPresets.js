export const CATEGORY_OPTIONS = [
  {
    id: "phone",
    name: "手机",
    subtitle: "IMEI/SN、激活状态、配件",
    mode: "inspection"
  },
  {
    id: "computer",
    name: "电脑",
    subtitle: "机身 SN、开机、接口外观",
    mode: "inspection"
  },
  {
    id: "collectible",
    name: "潮玩",
    subtitle: "盒损、内托、特典、缺件",
    mode: "standard"
  },
  {
    id: "bulky",
    name: "大件",
    subtitle: "外箱、缓冲、破损、配件",
    mode: "standard"
  }
];

const SHARED_STEPS = [
  {
    id: "privacy_label",
    title: "拍面单与未开封状态",
    shortTitle: "面单与未开封",
    instruction: "遮挡隐私后拍面单",
    hint: "姓名、电话、完整地址先遮住",
    required: true,
    type: "photo",
    targets: ["面单局部", "未开封整体"]
  },
  {
    id: "outer_box_sides",
    title: "记录外箱六面",
    shortTitle: "外箱六面",
    instruction: "按正背左右上下拍外箱",
    hint: "有压痕就说“标记异常”",
    required: true,
    type: "multi_photo",
    substeps: ["正面", "背面", "左侧", "右侧", "上方", "下方"],
    targets: ["外箱六面", "压痕", "破损"]
  },
  {
    id: "seal",
    title: "拍封条近景",
    shortTitle: "封条",
    instruction: "开箱前拍封条和胶带边缘",
    hint: "重点看二次封箱痕迹",
    required: true,
    type: "photo",
    targets: ["封条", "胶带边缘"]
  },
  {
    id: "inner_packaging",
    title: "记录内包装",
    shortTitle: "内包装",
    instruction: "打开后先别拿散",
    hint: "拍缓冲材料和商品摆放",
    required: true,
    type: "photo",
    targets: ["气泡膜", "泡棉", "内托", "摆放状态"]
  }
];

const PHONE_STEPS = [
  ...SHARED_STEPS,
  {
    id: "product_box",
    title: "拍手机盒与标签",
    shortTitle: "手机盒",
    instruction: "拍手机盒整体和侧面标签",
    hint: "标签要尽量清晰",
    required: true,
    type: "photo",
    targets: ["手机盒", "盒身标签"]
  },
  {
    id: "phone_body",
    title: "检查手机本体",
    shortTitle: "手机本体",
    instruction: "拍屏幕、边框、镜头",
    hint: "疑似划痕需补拍反光角度",
    required: true,
    type: "photo",
    targets: ["屏幕", "边框", "镜头", "背板"]
  },
  {
    id: "phone_accessories",
    title: "平铺配件清单",
    shortTitle: "配件",
    instruction: "配件平铺后拍一张",
    hint: "缺件时标记异常",
    required: true,
    type: "photo",
    targets: ["充电线", "卡针", "说明书", "赠品"]
  },
  {
    id: "phone_sn",
    title: "记录 IMEI / SN",
    shortTitle: "IMEI/SN",
    instruction: "拍外盒、机身或系统编码",
    hint: "可说“读一下 SN”手动补充",
    required: true,
    type: "code",
    codeScopes: ["outer_box", "product_box", "device_body", "system_page"],
    targets: ["IMEI", "SN", "系统设置页"]
  },
  {
    id: "activation",
    title: "记录激活或保修状态",
    shortTitle: "激活状态",
    instruction: "拍激活/保修查询页面",
    hint: "页面不清楚可以重拍",
    required: false,
    type: "photo",
    targets: ["激活状态", "保修状态"]
  }
];

const COMPUTER_STEPS = [
  ...SHARED_STEPS,
  {
    id: "computer_box",
    title: "拍电脑盒与标签",
    shortTitle: "电脑盒",
    instruction: "拍商品盒整体和 SN 标签",
    hint: "标签要靠近并停留 2 秒",
    required: true,
    type: "photo",
    targets: ["电脑盒", "SN 标签"]
  },
  {
    id: "computer_body",
    title: "检查主机外观",
    shortTitle: "主机外观",
    instruction: "拍 A/D 面、屏幕和接口",
    hint: "磕碰、弯折、坏点要标记",
    required: true,
    type: "photo",
    targets: ["A 面", "D 面", "屏幕", "接口"]
  },
  {
    id: "computer_accessories",
    title: "记录配件与说明书",
    shortTitle: "电脑配件",
    instruction: "拍充电器、线材和说明书",
    hint: "配件平铺更容易核对",
    required: true,
    type: "photo",
    targets: ["充电器", "线材", "说明书"]
  },
  {
    id: "computer_sn",
    title: "记录机身与系统 SN",
    shortTitle: "机身 SN",
    instruction: "拍机身标签和系统信息页",
    hint: "不一致时补拍整体和近景",
    required: true,
    type: "code",
    codeScopes: ["outer_box", "product_box", "device_body", "system_page"],
    targets: ["机身 SN", "系统 SN", "保修页面"]
  },
  {
    id: "boot_check",
    title: "记录开机状态",
    shortTitle: "开机状态",
    instruction: "拍首次开机或系统桌面",
    hint: "坏点或异常提示要补拍",
    required: false,
    type: "photo",
    targets: ["开机画面", "系统桌面", "异常提示"]
  }
];

const COLLECTIBLE_STEPS = [
  ...SHARED_STEPS,
  {
    id: "collectible_box",
    title: "拍商品盒六面",
    shortTitle: "商品盒",
    instruction: "拍外盒六面和盒角",
    hint: "盒损重点拍近景",
    required: true,
    type: "photo",
    targets: ["商品盒", "盒角", "封膜"]
  },
  {
    id: "tray_parts",
    title: "记录内托与配件",
    shortTitle: "内托配件",
    instruction: "拍内托、主体、替换件",
    hint: "缺特典时标记异常",
    required: true,
    type: "photo",
    targets: ["主体", "替换件", "特典", "编号卡"]
  }
];

const BULKY_STEPS = [
  ...SHARED_STEPS,
  {
    id: "damage_area",
    title: "记录破损位置",
    shortTitle: "破损位置",
    instruction: "拍整体、破损近景、参照物",
    hint: "尺子或手指可作为参照",
    required: true,
    type: "photo",
    targets: ["破损位置", "参照物", "内包装"]
  },
  {
    id: "bulky_parts",
    title: "记录安装配件",
    shortTitle: "安装配件",
    instruction: "平铺五金和说明书",
    hint: "缺件时拍清单对照",
    required: true,
    type: "photo",
    targets: ["五金", "说明书", "板材"]
  }
];

const PRESETS = {
  phone: PHONE_STEPS,
  computer: COMPUTER_STEPS,
  collectible: COLLECTIBLE_STEPS,
  bulky: BULKY_STEPS
};

export function getCategoryOption(categoryId) {
  return CATEGORY_OPTIONS.find((item) => item.id === categoryId) || CATEGORY_OPTIONS[0];
}

export function getFlowSteps(categoryId) {
  return (PRESETS[categoryId] || PHONE_STEPS).map((step, index) => ({
    ...step,
    index,
    status: "pending",
    evidenceCount: 0,
    abnormal: false,
    notes: [],
    photos: [],
    codes: []
  }));
}

export function createSession(categoryId) {
  const category = getCategoryOption(categoryId);
  const now = new Date();
  return {
    id: `proofbox-${now.getTime()}`,
    appVersion: "1.0.0",
    categoryId: category.id,
    categoryName: category.name,
    mode: category.mode,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    currentIndex: 0,
    steps: getFlowSteps(category.id),
    abnormalities: [],
    snRecords: [],
    userNotes: [],
    summary: "",
    afterSalesMessage: ""
  };
}

export function getCurrentStep(session) {
  if (!session || !Array.isArray(session.steps)) return null;
  return session.steps[session.currentIndex] || session.steps[0] || null;
}

export function countCompleted(session) {
  return session.steps.filter((step) => step.status === "done" || step.status === "skipped").length;
}

export function evidenceCompleteness(session) {
  const required = session.steps.filter((step) => step.required);
  if (required.length === 0) return 100;
  const completed = required.filter((step) => step.status === "done").length;
  return Math.round((completed / required.length) * 100);
}

export function getMissingRequiredSteps(session) {
  return session.steps
    .filter((step) => step.required && step.status !== "done")
    .map((step) => step.shortTitle || step.title);
}
