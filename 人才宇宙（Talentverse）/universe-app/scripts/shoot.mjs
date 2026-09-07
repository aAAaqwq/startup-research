import puppeteer from 'puppeteer-core'

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const BASE = 'http://localhost:4173/'
const OUT = '/tmp/tv_shots2'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const findAndClick = async (page, needle) => {
  const ok = await page.evaluate((n) => {
    const btns = [...document.querySelectorAll('button')]
    const b = btns.find((x) => x.textContent.includes(n))
    if (b) { b.click(); return true }
    return false
  }, needle)
  if (!ok) throw new Error('button not found: ' + needle)
  await sleep(400)
}

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--force-device-scale-factor=2'],
  defaultViewport: { width: 900, height: 1500, deviceScaleFactor: 2 },
})

const page = await browser.newPage()
await page.goto(BASE, { waitUntil: 'networkidle0' })
await page.evaluate(() => localStorage.clear())
await page.reload({ waitUntil: 'networkidle0' })
await sleep(600)

// —— 候选端：建档到档案收口 ——
await findAndClick(page, '上传：项目讲解 PDF')   // 首料
await sleep(5200)
await findAndClick(page, '上传：上线后首月销售周报') // 补料
await sleep(5200)
await findAndClick(page, '口径这块没单独做过')      // 纵深 → 收口成档案
await sleep(6000)
await page.screenshot({ path: OUT + '/cand-archive.png', fullPage: true })
console.log('shot cand-archive')

// —— 切雇主端：要人 → 精选 ——
await findAndClick(page, '雇主端 · 敢用的人')
await sleep(1200)
await findAndClick(page, '上传：JD')
await sleep(6000)
await page.screenshot({ path: OUT + '/emp-result.png', fullPage: true })
console.log('shot emp-result')

// —— 雇主：约面 #1 → 回执 ——
await findAndClick(page, '约面 #1 阿哲')
await sleep(3200)
await page.screenshot({ path: OUT + '/emp-receipt.png', fullPage: true })
console.log('shot emp-receipt')

// —— 回候选端：档案新增"被采信记录" ——
await findAndClick(page, '回到候选端')
await sleep(1200)
const res = await page.evaluate(() => document.body.textContent.includes('被采信记录'))
console.log('candidate shows credibility block:', res)
// 滚动到底部附近的档案卡
await page.evaluate(() => {
  const els = [...document.querySelectorAll('.panel')]
  const arc = els.find((e) => e.textContent.includes('你的能力证据档案'))
  if (arc) arc.scrollIntoView({ block: 'start' })
})
await sleep(600)
await page.screenshot({ path: OUT + '/cand-cred.png', fullPage: true })
console.log('shot cand-cred')

await browser.close()
