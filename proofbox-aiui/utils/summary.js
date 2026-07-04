import { evidenceCompleteness, getMissingRequiredSteps } from "./flowPresets.js";

const AFTER_SALES_LABELS = {
  package_damage: "外包装破损",
  seal_issue: "封条异常",
  scratch: "商品划痕或磕碰",
  missing_accessory: "配件缺失",
  sn_mismatch: "编码不一致",
  other: "其他异常"
};

export function summarizeSession(session) {
  const score = evidenceCompleteness(session);
  const missing = getMissingRequiredSteps(session);
  const evidenceCount = session.steps.reduce((sum, step) => sum + (step.evidenceCount || 0), 0);
  const abnormalCount = session.abnormalities.length;
  const snCount = session.snRecords.length;
  const completedNames = session.steps
    .filter((step) => step.status === "done")
    .map((step) => step.shortTitle || step.title)
    .join("、");

  if (abnormalCount === 0) {
    return `本次${session.categoryName}开箱记录已完成。系统已记录${completedNames || "核心开箱节点"}，共形成 ${evidenceCount} 条证据记录，编码记录 ${snCount} 条。当前未标记明显异常，证据链完整度 ${score}%。${missing.length ? `仍建议补充：${missing.join("、")}。` : "建议保留本次开箱记录，以便后续查询或售后沟通。"}`;
  }

  const abnormalText = session.abnormalities
    .map((item) => `${AFTER_SALES_LABELS[item.label] || item.label}（${item.stepTitle}）`)
    .join("、");

  return `本次${session.categoryName}开箱记录已完成。系统已记录${completedNames || "核心开箱节点"}，共形成 ${evidenceCount} 条证据记录，编码记录 ${snCount} 条。流程中标记了 ${abnormalCount} 项异常：${abnormalText}。证据链完整度 ${score}%。${missing.length ? `建议补充：${missing.join("、")}。` : "异常相关节点已完成基础补拍，可用于后续售后沟通。"}`;
}

export function generateAfterSalesMessage(session, userMemory = {}) {
  if (!session.abnormalities.length) {
    return "您好，我已在收到商品后第一时间完成开箱记录，目前暂未发现明显外观损坏、缺件或编码异常。相关开箱证据我会继续保留，如后续发现问题再联系处理，谢谢。";
  }

  const abnormalText = session.abnormalities
    .map((item) => {
      const label = AFTER_SALES_LABELS[item.label] || "异常";
      return `${label}${item.description ? `：${item.description}` : ""}`;
    })
    .join("；");

  const evidenceNames = session.steps
    .filter((step) => step.status === "done" && (step.evidenceCount || 0) > 0)
    .map((step) => step.shortTitle || step.title);

  const request = session.abnormalities.some((item) => item.label === "missing_accessory")
    ? "补发缺失配件或协助换货"
    : "协助核实并处理换货或退货退款";

  const platform = userMemory.platform || "贵平台";
  return `您好，我在收到商品后第一时间进行了开箱记录。开箱过程中发现${abnormalText}。相关证据已保留，包括${evidenceNames.join("、")}等材料。麻烦${platform}协助核实，并${request}，谢谢。`;
}

export function buildModelPrompt(session, userMemory = {}) {
  return [
    "你是开箱取证助手 ProofBox，请根据结构化记录生成简洁、礼貌、可复制的中文开箱总结和售后说明。",
    "要求：不要夸大异常；细小瑕疵只写用户已标记或疑似；按问题、证据、诉求组织。",
    `用户偏好语气：${userMemory.tone || "礼貌但坚定"}`,
    `商品类型：${session.categoryName}`,
    `证据链完整度：${evidenceCompleteness(session)}%`,
    `步骤记录：${JSON.stringify(session.steps.map((step) => ({
      id: step.id,
      title: step.title,
      status: step.status,
      evidenceCount: step.evidenceCount,
      abnormal: step.abnormal,
      notes: step.notes,
      codes: step.codes
    })))}`
  ].join("\n");
}
