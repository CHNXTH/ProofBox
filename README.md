# ProofBox

开箱有证 ProofBox 是基于 Rokid Glasses / AIUI 的第一视角开箱取证智能体。

## 项目结构

- `proofbox-aiui/`: AIUI 智能体源码，可在 Rokid Craft 中维护。
- `proofbox-aiui/docs/submission-fields.md`: 灵珠平台创建智能体时可填写的内容。
- `proofbox-aiui/docs/tooling.md`: AIX 打包工具和本地打包说明。
- `开发教程/ROKID AIUI .txt`: 本项目参考的 Rokid AIUI 开发教程资料。

## 本地检查

```bash
cd proofbox-aiui
npm run check
npm run pack:aix
```

打包产物会生成到项目根目录 `proofbox.aix`。
