import { test, expect } from '@playwright/test';

/**
 * Every real app route from src/router/index.js (hash history).
 * Catch-all NotFound is omitted — a nonsense path still mounts #app, but
 * the goal is to smoke the declared pages, not 404 UX.
 *
 * /lounge is auth-gated and redirects to /login; that is expected and OK.
 */
const ROUTES = [
  '/',
  '/about',
  '/events',
  '/study',
  '/teams',
  '/contact',
  '/login',
  '/lounge',
  '/dashboard',
  '/community',
  '/community/technical',
  '/community/cultural',
  '/community/esports',
  '/meetups',
  '/meetups/delhi-ncr',
  '/meetups/mumbai',
  '/meetups/bangalore',
  '/meetups/kolkata',
  '/meetups/hyderabad',
  '/meetups/patna',
  '/meetups/chandigarh',
  '/meetups/chennai',
  '/meetups/lucknow',
  '/verify-certificate',
];

function hashUrl(path) {
  // Hash router: base is origin only; route lives after #.
  return path === '/' ? '/#/' : `/#${path}`;
}

test.describe('route smoke', () => {
  for (const path of ROUTES) {
    test(`renders ${path} without console errors`, async ({ page }) => {
      const consoleErrors = [];
      const pageErrors = [];

      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });
      page.on('pageerror', (err) => {
        pageErrors.push(err.message);
      });

      await page.goto(hashUrl(path), { waitUntil: 'networkidle' });

      const app = page.locator('#app');
      await expect(app).toBeVisible();

      const content = await app.evaluate((el) => {
        const text = (el.textContent || '').trim();
        const html = (el.innerHTML || '').trim();
        return { text, html };
      });
      expect(
        content.text.length > 0 || content.html.length > 0,
        `#app should render non-empty content for ${path}`
      ).toBe(true);

      expect(pageErrors, `pageerror on ${path}: ${pageErrors.join(' | ')}`).toEqual([]);
      expect(consoleErrors, `console error on ${path}: ${consoleErrors.join(' | ')}`).toEqual([]);
    });
  }
});
