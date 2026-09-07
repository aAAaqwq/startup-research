# Talentverse 人才宇宙 · Agent 驱动对话平台原型（React）

> 同一套 agent 内核，双端不同的脸：**候选端**把"做过的事"变成带得走的**能力证据档案**；**雇主端**把"一句话/一份 JD"变成**敢用的人 + 敢退换担保**。交互只有一种：说话 / 拖文件，繁杂过程全部遮蔽在 agent 后面。

## 运行

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # 产物在 dist/
```

重置演示进度：右上角「重置」。

## 目录

```
src/
  types.ts                领域类型（Level 三档 / Archive / CandidateHit…）
  msg.ts                  消息模型（text/attach/thinking/conclusion/archive/emp/note）
  data/universe.ts        种子与诚实文案（档案/证据/JD/雇主精选 + 徽章语义绑定）
  engine/flows.ts         对话状态机：候选建档→补料→升档→收口；雇主要人→精选→约面→被采信回写
  lib/storage.ts          localStorage schema 版本化（tv.uni.v1）
  components/
    ChatConv.tsx          对话容器：状态机 + 定时播放 + Composer（说话/拖文件/建议 chips）
    cards.tsx             结论卡 / 档案卡 / 雇主精选卡 / 升档通知 / 担保印朱块 / 折叠"它核了什么"
  views/                  候选端 / 雇主端（同一 Conversation，两张脸）
  App.tsx                 顶栏双端切换 + 被采信记录贯通两端
scripts/shoot.mjs         puppeteer 走主流程截图验收
```

## 设计口径（诚实铁律，源码里逐条兑现）

- **不评价人，只处理证据**：任何结论都锚定"可点开的原件"。
- **三档徽章语义绑定**：验青=已验证（敢背书·有源可核）；虚线=孤证（只有自述·不背书）；灰=待补（补料即点亮）。合成总分被明令禁止。
- **担保只盖"试用不符可退换"，且只对已验证部分**：孤证/待补不在担保内 ——"那部分我本来就没敢跟你收钱"。
- **措辞红线**：孤证不讲成已验证；不下"此人可靠"人格断言；不承诺 offer；涉建议处标"AI 辅助评估 + 人工复核终审"。
- 代码按 Vercel `react-best-practices` 执行：组件顶层定义、函数式 setState、渲染期推导派生状态、交互逻辑在事件处理器、localStorage 惰性读取 + schema 版本化、显式三元渲染。
