# ProofBox Submission Fields

## 创建智能体

智能体名称：开箱有证 ProofBox

版本号：1.0.0

类别：生活

功能介绍：

开箱有证 ProofBox 是一款基于 Rokid Glasses / AIUI 的第一视角开箱取证助手。用户在拆快递、验手机、验电脑或记录贵重商品开箱时，可以通过语音进入分步取证流程。眼镜端以绿色轻量 HUD 提示当前步骤，引导用户依次记录面单遮挡、未开封状态、外箱六面、封条、内包装、商品本体、配件与 SN/条码信息。用户可通过语音完成拍照、重拍、下一步和标记异常。发现破损、缺件、划痕或编码不一致时，系统会提示补拍整体图、近景图和参照物图。流程结束后，ProofBox 会整理证据清单、异常说明和售后沟通文案，帮助用户降低漏拍、错拍和问题描述不清带来的售后沟通成本。

开场白：

你好，我是开箱有证 ProofBox。你可以说“我要拆一台手机”“帮我验一台电脑”或“记录这次开箱”。我会一步一步提示你该拍哪些证据，并在发现异常时帮你补齐说明材料。

提示测试：

我要拆一台手机

## JSUI 包

JSUI 包标题：ProofBox

JSUI 包版本：1.0.0

JSUI 包页面：

- pages/index/index
- pages/flow/index
- pages/summary/index

JSUI 包工具：

- start_unboxing_flow
- capture_evidence
- mark_abnormal
- record_sn
- generate_summary
- generate_after_sales_message

## 打包

```bash
aiui-aix pack --optimize -o proofbox.aix proofbox-aiui
```

## MD5

生成 `.aix` 后运行：

```bash
md5 proofbox.aix
```
