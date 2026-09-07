import puppeteer from 'puppeteer-core'
const CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const b=await puppeteer.launch({executablePath:CHROME,headless:'new',args:['--no-sandbox','--force-device-scale-factor=2'],defaultViewport:{width:1320,height:1500,deviceScaleFactor:2}})
const p=await b.newPage();await p.goto('http://localhost:4173/',{waitUntil:'networkidle0'})
await p.evaluate(()=>localStorage.clear());await p.reload({waitUntil:'networkidle0'})
await new Promise(r=>setTimeout(r,900))
await p.screenshot({path:'/tmp/tv_dyn/side-open.png',fullPage:true})
await p.evaluate(()=>{const x=[...document.querySelectorAll('.collap')][0];if(x)x.click()})
await new Promise(r=>setTimeout(r,500))
await p.screenshot({path:'/tmp/tv_dyn/side-narrow.png',fullPage:true})
await b.close();console.log('OK')
