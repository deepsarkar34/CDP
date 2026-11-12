// Click through every beat in every vendor mode; fail on console errors; save screenshots.
// Usage: npm run build && npm run walkthrough   (expects `npm run preview` on :4173, or pass a URL)
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const url = process.argv[2] || 'http://localhost:4173/';
const out = 'artifacts';
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', e => errors.push(`pageerror: ${e.message}`));
page.on('console', m => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });

await page.goto(url);
const total = await page.evaluate(() => document.querySelectorAll('.step').length);
if (total !== 7) errors.push(`expected 7 steps on the map, found ${total}`);

for (const vendor of ['neutral', 'salesforce', 'adobe', 'databricks']) {
  await page.keyboard.press('r');
  // select vendor via its button (labels come from the vendor pack)
  const idx = ['neutral', 'salesforce', 'adobe', 'databricks'].indexOf(vendor);
  await page.locator('.seg button').nth(idx).click();
  let beat = 0;
  while (true) {
    await page.waitForTimeout(vendor === 'neutral' ? 1400 : 500);
    if (vendor === 'neutral' || beat % 4 === 0) await page.screenshot({ path: `${out}/${vendor}-${String(beat).padStart(2, '0')}.png` });
    const disabled = await page.locator('.nav .btn.primary').isDisabled();
    if (disabled) break;
    await page.keyboard.press('ArrowRight');
    beat++;
  }
  console.log(`${vendor}: ${beat + 1} beats`);
}

// Deep dive + consent off on Activate
await page.keyboard.press('7'); await page.keyboard.press('d'); await page.keyboard.press('c');
await page.waitForTimeout(1200);
await page.screenshot({ path: `${out}/deep-consent-off.png`, fullPage: true });

await browser.close();
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log('Walkthrough OK, no console errors.');
