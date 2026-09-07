# 人才宇宙 · 布局与通用 Agent 交互优化（参考 b.ai）— 设计

> 状态：设计（Act8 候选）。范围：三栏 Agent 工作台 + 通用 agent 会话/交互对象模型 + 三类人类闸门。
> 依据：b.ai / B.AI（chat.b.ai）布局与 BAIclaw 交互（[docs.b.ai](https://docs.b.ai/zh-Hans/baiclaw/introduction/)、[ChainCatcher 攻略](https://www.chaincatcher.com/zh-tw/article/2260716)、[imToken 攻略](https://support.token.im/hc/zh-cn/articles/61238399260441)）。证据分 [核]/[供]/[推]。

## 1. b.ai 最值得移植的三点

1. **左边是"能力台"不是"菜单页"**：工具轨常驻 对话/模型/@agent/渠道/技能/定时/设置 [核]；对话里 `@agent` 直切另一 agent 独立上下文。→ 左轨按"对象分节"，常驻当前视图活动的"分析台 agent"及其状态（空闲 / 运行 / 等你 / 复核员 A-07 处理中）。
2. **身份与成本不藏后台**：钱包登录 + 充值入口在顶；x402=HTTP402 先付费后响应；ERC-8004=地址即账户。→ 顶栏 `IdentityAnchor`（我是谁端 + 授权出示范围 ON/NONE + 复核员）；"已验证核验格才敢收费、孤证/待补不收钱、试用不符可退换"做成每个核验任务的可见计价行，而非卡脚小字。
3. **长产物不随对话滚丢**：agent 状态常驻可观察，产物固化为 artifact。→ 最大杠杆：把结果卡从"消息 kind"升级为独立的"产物/任务"层（见 §3）。

## 2. 三栏 Agent 工作台（桌面 ≥1180px）

```
顶栏  [宇·Talentverse] [候选端|雇主端|闭环]   ◉授权出示:ON·阿哲 | 复核 A-07 | 重置
左轨 240(可收64) │ 中 对话+卡片事件流 (max720) │ 右 Agent 证据工作台 364px
 新任务/对话 ＋    │ viewtop 我的星/分档/星讯      │ A 当前任务 · 步骤轨道(running/等你)
 分析台(agent本体) │ persona · ChatConv 事件流     │   每步可点开"它核了什么"反链
  档案整理师/验人台 │ Composer 上方 = Gate 行(待确认) │ B 产物 artifacts(档案/精选/出示/邀约)
 工作区            │                             │ C 边界/计价行 · 孤证待补不收钱
 历史对话(n)        │                             │ D 上下文(JD星球/公司/原件)
```

断点：≥1280 三栏满配；980–1279 右栏收窄；720–979 左轨可收 + 右栏=底部抽屉（Composer 上浮钮唤醒）；<720 单列 + 全屏覆盖层。视觉沿用深空 token；闸门语义色=amber 虚线族，注释明示 ≠ 证据档色。

## 3. 通用 Agent 交互对象模型（`session.ts` 草案）

- **Step**: label / state(pending·running·done·blocked) / agent(谁干的·含人工 A-07) / tool / openedBy(反链)
- **Gate**: kind=`external`(发外) | `spend`(要钱/触发担保) | `evidence-mutation`(改证据草稿)；draft + against(原文对照)；requiredBy；resolution
- **Artifact**: kind(archive·result·share-link·invite·jd) / anchorMsgId(时间锚) / full(全量渲染源)
- **Task**: status(running·awaiting_human·done) / steps / gates / artifacts
- **Session**: identity(who+授权范围+reviewer) / transcript(现 msg.ts 时间线，兼容历史) / activeTask
- 归一：pipeline.steps→Task.steps；archive/emp/conclusion→Artifact+轻卡；thinking→step running；note+动作→Gate。

**何时要人（三类闸）**：发外部（出示/约面/回执）/ 要钱或触发担保（待补升已验证核验格）/ 改证据（润色草稿→生效）。确认 UI 三处同步：消息卡"待你决定"、Composer 上 Gate 行、右栏 C。reject → agent 显式回退说明，永不静默改更版本。

## 4. 实现清单（组件级，估算 P0 8–12 人日 / P1 10–14 人日）

P0：Workspace 三栏 grid；EvidenceWorkbench(A/B)；ChatConv 产物登记；CSS 断点/抽屉。P1：session.ts、flows 上抛 gate/artifact、ApprovalGate、SideChrome agent 节、IdentityAnchor、history 扩展、轻卡收尾。
文件：Workspace / ChatConv / PipelineCard(variant inline|workbench) / cards(ArtifactView) / SideChrome / history / views·Candidate·Employer / App / styles.css + 新建 EvidenceWorkbench / ApprovalGate / IdentityAnchor / session.ts。

## 5. 与去中心化 Protocol 的呼应（预留位，不画假链 icon）

主体标识→身份锚 · 证据三档+出示链接→可验证凭证 · 信号账本(stats)/被采信记录→可审计事件 · 三档语义+约面中性+孤证不收钱+真人复核→协议 trust 规则候选 · 步骤/闸门→可审计 workflow 轨迹。
