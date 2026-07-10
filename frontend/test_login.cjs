const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('response', response => {
    if (response.status() === 401 || response.status() === 403) {
      console.log('UNAUTHORIZED REQUEST:', response.url(), response.status());
    }
  });

  await page.goto('http://localhost:5173/login');
  
  await page.type('input[name="username"]', 'bendahara');
  await page.type('input[name="password"]', '123456');
  
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle0' }).catch(e => console.log('Navigation timeout')),
    page.click('button[type="submit"]')
  ]);
  
  await new Promise(r => setTimeout(r, 2000));
  
  console.log('Current URL after login:', page.url());
  
  await browser.close();
})();
