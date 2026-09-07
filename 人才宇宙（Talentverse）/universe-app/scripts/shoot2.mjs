import puppeteer from 'puppeteer-core'

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const BASE = 'http://localhost:4173/'
const OUT = '/tmp/tv_act2'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const clickText = async (page, needle, timeoutMs = 8000) => {
  const t0 = Date.now()
  for (;;) {
    const ok = await page.evaluate((n) => {
      const b = [...document.querySelectorAll('button')].find((x) => x.textContent.includes(n))
      if (b) { b.click(); return true }
      return false
    }, needle)
    if (ok) { await sleep(300); return }
    if (Date.now() - t0 > timeoutMs) throw new Error('button not found: ' + needle)
    await sleep(250)
  }
}

const browser = await puppeteer.launch({
  executablePath: CHROME, headless: 'new',
  args: ['--no-sandbox', '--force-device-scale-factor=2'],
  defaultViewport: { width: 900, height: 1500, deviceScaleFactor: 2 },
})
const page = await browser.newPage()
await page.goto(BASE, { waitUntil: 'networkidle0' })
await page.evaluate(() => localStorage.clear())
await page.reload({ waitUntil: 'networkidle0' })
await sleep(700)

// 01 候选端门户（fresh）
await page.screenshot({ path: OUT + '/01-cand-portal.png', fullPage: true })

// 建档
await clickText(page, '投第一颗星')
await sleep(500)
await clickText(page, '上传：项目讲解 PDF'); await sleep(5600)
await clickText(page, '上传：上线后首月销售周报'); await sleep(5600)
await clickText(page, '口径这块没单独做过'); await sleep(6500)
// 02 候选端：我的星入轨 + 星讯 + 档案
await page.screenshot({ path: OUT + '/02-cand-archive-sky.png', fullPage: true })

// 润色 action
await clickText(page, '润色档案'); await sleep(3600)
await page.screenshot({ path: OUT + '/02b-cand-polish.png', fullPage: true })

// 切雇主端（门户）
await clickText(page, '雇主端'); await sleep(600)
await page.screenshot({ path: OUT + '/03-emp-portal.png', fullPage: true })

// 要人 → 星域点亮 + 精选
await clickText(page, '开始要人'); await sleep(500)
await clickText(page, '上传：JD'); await sleep(7000)
await page.screenshot({ path: OUT + '/04-emp-sky-result.png', fullPage: true })

// 点星 = 展开查看（被看记录）
await page.evaluate(() => {
  const s = [...document.querySelectorAll('.star')].find((x) => x.getAttribute('aria-label') === '阿哲')
  if (s) { s.click(); return true }
  return false
})
await sleep(800)
await page.screenshot({ path: OUT + '/04b-emp-star-pop.png', fullPage: true })
await page.evaluate(() => document.querySelector('.star-pop .close')?.click())
await sleep(400)

// 约面
await clickText(page, '约面 #1 阿哲'); await sleep(3800)
await page.screenshot({ path: OUT + '/05-emp-meet.png', fullPage: true })

// 闭环全景
await clickText(page, '闭环'); await sleep(600)
await page.screenshot({ path: OUT + '/06-orbit.png', fullPage: true })

// 回候选端：我的星出现约面环 + 被约面星讯
await clickText(page, '候选端'); await sleep(900)
await page.evaluate(() => {
  const cards = [...document.querySelectorAll('.panel')]
  const arc = cards.find((e) => e.textContent.includes('你的能力证据档案'))
  if (arc) arc.scrollIntoView({ block: 'start' })
})
await sleep(500)
await page.screenshot({ path: OUT + '/07-cand-meet-updated.png', fullPage: true })

await browser.close()
console.log('DONE')
