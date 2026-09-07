# TVP · 人才宇宙开放协议 v0.1 草案（去中心化 AI 招聘）

> 一句话：**把「谁能干活」的验证，做成候选人自持、授权出示、可跨方核验、可条件化结算的开放凭证与交互协议——验证与撮合解耦。**
> 生成方：ast-cro（第一性研究）+ ast-cto（协议架构），2026-09-07。合规条目为 `INFERENCE`，上线前交 CLO/CDO 复核。
> 这不是链协议：公有链只是可选的哈希锚定载具；**现在唯一该做的是 0.x MVP**（签名文档 + 唯一核验 URL + 核验端点，学信网同款，一页代码量级）。

## 0. 元判断（先读）

- **protocol 是对的终局语法，但不是产品；可移植资产是真楔子，但其发行权不属于协议，属于"担责的验证层"。**
- 招聘 agent 化后，真正开放、尚无归属的互操作面在 **agent 层的身份—可验证动作—结算**（ERC-8004/x402 是模板），而非"人的凭证匿名化"。
- 荷兰国家"Integraal Skillspaspoort"反例：技能可移植资产即便在西方也是**国家/社会伙伴主导的公共基建**，不是 permissionless 创业公司单干。→ protocol 只做薄开放层，价值/责任沉淀在 issuer/verifier 生意。

## 1. 第一性原语与裁决

- 招聘 = 雇主在信息不对称下为"此人未来产出"这个未知数付费。去中心化能砍掉 P3(中介抽租)与 P4(孤岛锁定)；**对 P2(伪证趋零) 无能为力甚至有害**——被放大的是验证层：担责的 issuer + 可证伪证据 + 失败赔付。
- 可移植甜点 = **attested performance evidence（受证绩效记录）**：明确定义条件下有担责见证、可重跑抽查证伪。不与"内容真伪"较劲，而在"出处+责任+可重验"上成立。
- **verification(验证/L1·生意) 与 credential(凭证/L2·开放标准) 必须拆层**。凭证走 VC/OpenBadges/OpenID4VC（便携性是免费的），差异化与护城河在 L1。
- AI 当工具，**担责的人/机构当 issuer**（AI 无法被诉、无声誉可损）。第三方专业验证者(你)是对的生态位：可证伪方法 + 声誉责任对赌(成单风险返还) + 结果回流校准 precision/recall。
- 无币：撮合激励由法币成单费对齐、验证质量由 issuer 声誉对齐；境内 token 是净负（PIPL/删除权、实名联盟信任、持牌结算、类金融监管）。替代=不可转让可撤销的补贴积分(运营会计) 或 现金买断 issuer 产能。
- 不搬 Boss/智联数据；只对你自己的凭证开放；风险返还是服务条款语义，非"保 offer/不过退费"。

## 2. Actor 与身份

holder(候选人·did:tv) / issuer(四子类: self·secondParty·assessor·official) / verifier(雇主及 agent) / referral·search agent(永远经 delegation 委托，不得独立出示) / governance·trust-list(阶段 0 单方、多 issuer 后多签)。
身份锚：发行时实名，对外伪匿名直到 reveal；SM2(国密)/ES256 双签名。能见度 = kind + ConsentScope 双重决定。

## 3. 核心对象（要点）

- **PVR 可携带验证记录**：schemaId/claim/grade/issuer/subject/secondParty(role+contactHashed)/evidence(EvidenceAsset·contentHash)/assess(methodRef·humanReviewAt·algFilingRef)/revocationUrl/status/prev 版本链/sig(SM2·ES256)。
- **grade 阶梯（禁自封升级铁律）**：`self`→孤证；`secondParty`→实名校验第二方或原件+业务时戳（强孤证→verified 合法入口）；`assessor`→可解释方法论+实操+人工复核（你阶段 1 的 verified 来源）；`official`→搭车。self 永不能签发高于 self 的档。
- **VerifiableResume**：facts 指向 PVR；自述必标 self；"排版即验证"被结构禁止。
- **ConsentScope**：grantee 定向/开放信封 · purpose · dataScope 精确到字段 · maxRevealCount · expires · 撤回=令牌全链路失效 · separateConsent(跨境/敏感/重大影响=true)。
- **Envelope 检索信封**：伪匿名 + claims(grade/since) + contactPolicy(ping-only 默认) + 无 PII；命中→脱敏事件进 holder 账本。
- **AuditEvent**：layer/actor/ref/脱敏 summary + 可选 hash-chain；计数只来自真实动作（沿用 stats 纪律）。
- **Invite/Interview**、**OutcomeWriteback**(只 `confirmed`/`disputed`，不建共享黑名单/降级画像)、**SettlementIntent**(成单费 20-30% + riskReturn 条件退款/换一 + 持牌 escrow，402 门控语义 x402 但法币)。

## 4. 分层与接口（OpenAPI 域，逻辑域可同实体托管）

- **L0 Identity**：`/dids` 签发/轮换/实名证明
- **L1 Verification**：`/schemas`、`/records`(issuer 签发·幂等)、**`/verify/{recId}`(公开核验·学信网同款·conformance 端点)**、revoke/dispute
- **L2 Consented Matching**：`/envelopes`(holder 管)、`/search`(registered verifier·仅 envelope)、`/hits/{id}/ping`、`/consents`、`/dossiers?scope=`(一次性定向出示)
- **L3 Interaction**：`/invites`(幂等去重)、`/interviews`
- **L4 Settlement**：`/settlement-intents` + `/events`(signed_offer/onboarded/pass_probation) + release；402 + `X-TVP-Payment`
- **L5 Reputation/Dispute**：只计 issuer 历史采信率(聚合去敏)，绝不做候选人黑箱分
- **L6 Governance/Trustlist**：issuer 准入/sanction + compliance 算法台账；除名/撤销升级=人类治理签
- 认证三态：person-token(OAuth2+PKCE) / client-cred+X-API-Key / **delegation-token + X-TVP-Principal + X-TVP-Scope**(agent 委托·ERC-8004 币无关版)。幂等键、429+Retry-After、撤销即 404。

## 5. 主流程 M0→M8 与"人类签字门"

建档(self 档) → assessor 真人评估发证(评估结论人签后发行·AI 参与需备案+告知) → holder 发 Envelope(默认 closed/ping) → verifier/agent 检索命中(无 PII) → holder 定向 ConsentScope 签字(跨境单独同意) → 出示 PVR+原件(短期一次性 URL)+公开 verify → Invite(候选人本人接受) → 面试 → 成交 hire(雇主财务签)→ 结算触发 + confirmed 回写 + issuer 校准(去敏) → 更强 claim 刷新 envelope 再被检索。
虚线闭环 = 协议自校准层（assessor 验证准确率可观测、可问责；不是候选人黑箱分）。

## 6. 迁移路径（现状 app = 参考实现 + 第一位 issuer + 第一个持有端）

| 现状 | TVP 对象 |
|---|---|
| Archive / 导出出示链接 | holder 记录 + 默认 VerifiableResume / 协议 share |
| 证据三档 | grade: assessor+secondParty / self(strong) / self / 未签发（点亮只能走第二方或 assessor） |
| 星讯 stats / 被采信 credits | AuditEvent + 命中示意 / confirmed 回写 |
| 面试空间 + 你亲自验证(阶段1交付) | assessor 档 PVR 的 assess.artifactId + EvidenceAsset(transcript) —— **服务→凭证最关键一跳** |
| JD星球/jobs.ts | verifier 持久化查询 + Invite 上下文 |
| InterviewInvite | Invite(挂 csId) |
| Guarantee | SettlementIntent 默认 riskReturn |

**分期**：0.x MVP(签名文档+核验 URL+端点·零新基建·本季) → 0.9 协议化(L1+schema registry+Consent 最小) → 1.0 开放(L2–L5·trustlist 邀请制·结算半自动) → 人才宇宙(或有)。
**放弃线**：09 首单死 / 凭证离你即归零 / 无独立 issuer 或 API 接入 / 国家先出统一标准(搭车当 issuer) / **0.x 完成 6 个月内凭证核验调用=0 → 冻结协议投入**。

## 7. 开放问题（最贵的是 Q3）

实名锚运营主体 · 首个能力 schema(BI 看板交付?) · **低样本下 issuer 校准信号质量(阶段1首单≈个位数会不会做成噪声)** · 核验端点责任边界/issuer 消亡 · 合规主体与跨境 · 撤销权力博弈 · delegation 滥用模型 · 402 法币托管参数 · 星火/学信网接入时机(建议等被吸收再搭车)。

## 8. 下阶段唯一能做的一手证据（改变决策的实验）

① 对真实成交候选铸造 L2 凭证并追踪"凭证在非本人渠道被采信"≥1 次（可移植性证明，无需同时播种双边）→ ② 独立 issuer 无补贴发证被采信 → ③ 雇主/ATS 接核验 API。**证据排序，不是信念排序。**

## 来源（本轮新核验）

x402(+AWS)·ERC-8004 spec/Taiko/Celo · B.AI 上线报道 · 荷兰 Skillspaspoort/HRMorgen · ONEST 状态页。其余 rails 事实与链接承 03/04 文档末尾来源行。
