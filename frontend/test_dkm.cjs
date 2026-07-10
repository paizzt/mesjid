const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('https://aplikasidkm.com/masuk', { waitUntil: 'networkidle2' });
  
  // Fill login form
  // Note: Since we don't know the exact selectors, we will try standard names or input types
  // Usually email is input[type="email"] and password is input[type="password"]
  try {
    await page.type('input[type="email"]', 'saya@rezamaulana.com');
  } catch(e) {
    await page.type('input[name="email"]', 'saya@rezamaulana.com');
  }
  
  await page.type('input[type="password"]', '0895333660777');
  
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle0' }).catch(e => console.log('Navigation timeout')),
    page.click('button[type="submit"]')
  ]);
  
  await new Promise(r => setTimeout(r, 5000));
  
  console.log('Current URL after login:', page.url());
  
  await page.screenshot({ path: 'aplikasi_dkm_dashboard.png', fullPage: true });
  console.log('Screenshot saved to aplikasi_dkm_dashboard.png');
  
  await browser.close();
})();
