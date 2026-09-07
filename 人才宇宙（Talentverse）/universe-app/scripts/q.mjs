import puppeteer from 'puppeteer-core'
const CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const b=await puppeteer.launch({executablePath:CHROME,headless:'new',args:['--no-sandbox','--force-device-scale-factor=2'],defaultViewport:{width:1280,height:1600,deviceScaleFactor:2}})
const p=await b.newPage()
await p.goto('http://localhost:4173/',{waitUntil:'networkidle0'})
await p.evaluate(()=>localStorage.clear())
await p.reload({waitUntil:'networkidle0'})
await new Promise(r=>setTimeout(r,1500))
await p.screenshot({path:'/tmp/tv_dyn/cand.png',fullPage:true})
// employer search sky
await p.evaluate(()=>{const x=[...document.querySelectorAll('button')].find(b=>b.textContent.includes('雇主端'));if(x)x.click()})
await new Promise(r=>setTimeout(r,700))
await p.evaluate(()=>{const x=[...document.querySelectorAll('button')].find(b=>b.textContent.includes('开始要人'));if(x)x.click()})
await new Promise(r=>setTimeout(r,600))
await p.evaluate(()=>{const x=[...document.querySelectorAll('button')].find(b=>b.textContent.includes('上传：JD'));if(x)x.click()})
await new Promise(r=>setTimeout(r,5200))
await p.screenshot({path:'/tmp/tv_dyn/emp.png',fullPage:true})
await b.close();console.log('OK')
