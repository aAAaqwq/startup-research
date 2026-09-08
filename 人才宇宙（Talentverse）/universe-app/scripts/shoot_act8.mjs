// Act8 验收截图：雇主搜索+右栏工作台 / 候选建档 / 闸门(约面) —— 三栏宽屏
import puppeteer from 'puppeteer-core'

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const BASE = 'http://localhost:4173/'
const OUT = '/tmp/tv_act8'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const mk = async () => {
  const fs = await import('node:fs')
  fs.mkdirSync(OUT, { recursive: true })
}
await mk()

const waitText = async (page, needle, timeout = 18000) => {
  const t0 = Date.now()
  while (Date.now() - t0 < timeout) {
    const hit = await page.evaluate((n) => document.body.textContent.includes(n), needle)
    if (hit) return true
    await sleep(250)
  }
  throw new Error('waitText timeout: ' + needle)
}

const clickExact = async (page, needle) => {
  const ok = await page.evaluate((n) => {
    const btns = [...document.querySelectorAll('button')]
    const b = btns.find((x) => x.textContent.trim() === n)
    if (b) { b.click(); return true }
    return false
  }, needle)
  if (!ok) throw new Error('clickExact not found: ' + needle)
}

const clickContain = async (page, needle) => {
  const ok = await page.evaluate((n) => {
    const btns = [...document.querySelectorAll('button')]
    const b = btns.find((x) => x.textContent.includes(n))
    if (b) { b.click(); return true }
    return false
  }, needle)
  if (!ok) throw new Error('clickContain not found: ' + needle)
}

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--force-device-scale-factor=2'],
  defaultViewport: { width: 1440, height: 1200, deviceScaleFactor: 2 },
})

const page = await browser.newPage()
await page.goto(BASE, { waitUntil: 'networkidle0' })
await page.evaluate(() => localStorage.clear())
await page.reload({ waitUntil: 'networkidle0' })
await sleep(700)

/* ========== 候选端：建档收口（右栏 A/B/C 应就位） ========== */
await waitText(page, '投第一颗星')
await clickContain(page, '投第一颗星')
await waitText(page, '上传：项目讲解 PDF')
await clickContain(page, '上传：项目讲解 PDF')
await waitText(page, '上传：上线后首月销售周报截图')
await clickContain(page, '上传：上线后首月销售周报截图')
await waitText(page, '口径这块没单独做过')
await clickContain(page, '口径这块没单独做过')
await waitText(page, '你的能力证据档案', 20000)
await sleep(900)
// 把对话滚到档案卡，让右栏产物与档案卡同屏
const sc = await page.evaluate(() => {
  const els = [...document.querySelectorAll('.panel')]
  const arc = els.find((e) => e.textContent.includes('你的能力证据档案'))
  if (arc) { arc.scrollIntoView({ block: 'start' }); return true }
  return false
})
await sleep(700)
await page.screenshot({ path: OUT + '/cand-workbench.png' })
console.log('shot cand-workbench (right col visible?) wb-col=', await page.evaluate(() => !!document.querySelector('.wb-col')))

/* ========== 切雇主端：搜索 → 右栏工作台 ========== */
await page.evaluate(() => {
  const btns = [...document.querySelectorAll('button')]
  const b = btns.find((x) => x.textContent.trim() === '雇主端')
  if (b) b.click()
})
await waitText(page, '开始要人')
await clickContain(page, '开始要人')
await waitText(page, '上传：JD（BI · 出海 SaaS）')
await clickContain(page, '上传：JD（BI · 出海 SaaS）')
await waitText(page, '约面 #1 阿哲', 22000)
await sleep(1200)
await page.screenshot({ path: OUT + '/emp-search-workbench.png' })
console.log('shot emp-search-workbench')

/* ========== 闸门：约面进 ApprovalGate，确认后才发出 ========== */
await clickContain(page, '约面 #1 阿哲')
await waitText(page, '确认发出', 8000)
await sleep(600)
await page.screenshot({ path: OUT + '/emp-meet-gate.png' })
console.log('gate row visible?', await page.evaluate(() => !!document.querySelector('.gate')))
await clickContain(page, '确认发出')
await waitText(page, '已把 #1（阿哲）', 12000)
await sleep(900)
console.log('invite recorded?', await page.evaluate(() => !!document.querySelector('.status.pending, .wb-art-badge')))

/* ========== 回候选端：面试回执经右栏闸门同意 → 采信 ========== */
await page.evaluate(() => {
  const btns = [...document.querySelectorAll('button')]
  const b = btns.find((x) => x.textContent.includes('回到候选端'))
  if (b) b.click()
})
await waitText(page, '同意面试', 15000)
await sleep(600)
await page.screenshot({ path: OUT + '/cand-invite-gate.png' })
await clickContain(page, '同意面试')
await waitText(page, '双向匹配', 8000).catch(() => {})
await sleep(900)
await page.screenshot({ path: OUT + '/cand-after-accept.png' })
console.log('all shots done')

await browser.close()
