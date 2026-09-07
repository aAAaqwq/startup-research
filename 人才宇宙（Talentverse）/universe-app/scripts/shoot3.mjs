import puppeteer from 'puppeteer-core'

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const BASE = 'http://localhost:4173/'
const OUT = '/tmp/tv_act4'
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
  defaultViewport: { width: 1280, height: 1600, deviceScaleFactor: 2 },
})
const page = await browser.newPage()
await page.goto(BASE, { waitUntil: 'networkidle0' })
await page.evaluate(() => localStorage.clear())
await page.reload({ waitUntil: 'networkidle0' })
await sleep(800)

// 01 候选门户 + 侧边栏
await page.screenshot({ path: OUT + '/01-cand-ws.png', fullPage: true })

// 建档快速走完（收口后看侧栏与档案）
await clickText(page, '投第一颗星'); await sleep(400)
await clickText(page, '上传：项目讲解 PDF'); await sleep(4800)
await clickText(page, '上传：上线后首月销售周报'); await sleep(4800)
await clickText(page, '口径这块没单独做过'); await sleep(6200)
await page.screenshot({ path: OUT + '/02-cand-chat-side.png', fullPage: true })

// 候选 简历档 panel
await clickText(page, '能力证据 / 简历'); await sleep(500)
await page.screenshot({ path: OUT + '/03-cand-resume.png', fullPage: true })
await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => b.textContent.includes('打开我的简历'))?.click())
await sleep(700)
await page.screenshot({ path: OUT + '/03b-cand-dossier.png', fullPage: true })
await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => b.textContent.includes('关闭'))?.click())
await sleep(300)

// 切雇主（顶栏 nav 按钮文字 "雇主端"）
await clickText(page, '雇主端'); await sleep(800)
await clickText(page, '开始要人'); await sleep(400)
await clickText(page, '上传：JD'); await sleep(6000)
await page.screenshot({ path: OUT + '/04-emp-search-side.png', fullPage: true })

// 简历池 panel
await clickText(page, '候选人简历池'); await sleep(600)
await page.screenshot({ path: OUT + '/05-emp-pool.png', fullPage: true })
await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => b.textContent.includes('打开简历 / 证据档'))?.click())
await sleep(700)
await page.screenshot({ path: OUT + '/05b-emp-dossier.png', fullPage: true })
await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => b.textContent.includes('关闭'))?.click())
await sleep(300)

// 回聊天，约面 → 面试空间 employer + candidate
await clickText(page, '人才宇宙搜索'); await sleep(400)
await clickText(page, '约面 #1 阿哲'); await sleep(2600)
await clickText(page, '面试空间'); await sleep(500)
await page.screenshot({ path: OUT + '/06-emp-interviews.png', fullPage: true })

// 候选端面试空间（看到公司信息，同意）
await clickText(page, '候选端'); await sleep(700)
await clickText(page, '面试空间'); await sleep(500)
await page.screenshot({ path: OUT + '/07-cand-interviews.png', fullPage: true })
await clickText(page, '同意面试'); await sleep(600)
await page.screenshot({ path: OUT + '/08-cand-accepted.png', fullPage: true })

await browser.close()
console.log('DONE')
