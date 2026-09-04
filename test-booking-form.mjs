import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();

try {
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  
  // 로그인 페이지일 것 같으니 스크린샷 먼저
  await page.screenshot({ path: '/tmp/1-initial.png' });
  console.log('✓ Initial page loaded');

} catch (err) {
  console.error('Error:', err.message);
} finally {
  await browser.close();
}
