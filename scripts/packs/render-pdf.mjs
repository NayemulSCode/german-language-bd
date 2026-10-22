// Renders print-ready HTML files to PDF with Chromium (needs Playwright; not a project dependency).
//   PLAYWRIGHT=/path/to/playwright/index.mjs CHROMIUM_PATH=/path/to/chromium node scripts/packs/render-pdf.mjs in.html out.pdf [in2.html out2.pdf …]
import { pathToFileURL } from 'node:url'

const { chromium } = await import(process.env.PLAYWRIGHT ? pathToFileURL(process.env.PLAYWRIGHT).href : 'playwright')
const pairs = process.argv.slice(2)
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined })
const footer = `<div style="font-size:8px;width:100%;padding:0 14mm;color:#7a839a;display:flex;justify-content:space-between;font-family:sans-serif"><span>GLBD · German Language BD — for personal study</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>`
for (let i = 0; i + 1 < pairs.length; i += 2) {
  const page = await browser.newPage()
  await page.goto(pathToFileURL(pairs[i]).href, { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)
  await page.pdf({ path: pairs[i + 1], format: 'A4', printBackground: true, displayHeaderFooter: true, headerTemplate: '<span></span>', footerTemplate: footer, margin: { top: '16mm', bottom: '18mm', left: '14mm', right: '14mm' } })
  await page.close()
  console.log('wrote', pairs[i + 1])
}
await browser.close()
