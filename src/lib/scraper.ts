import { chromium } from "playwright";

type LoginResult = {
  success: boolean;
  html?: string;
  error?: string;
};

export async function loginAndGetHtml(options: { url: string; account: string; password: string; timeoutMs?: number }): Promise<LoginResult> {
  const { url, account, password, timeoutMs = 30000 } = options;

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto(url, { waitUntil: "domcontentloaded", timeout: timeoutMs });

    // Try to locate text / account input and password input heuristically
    const textInput = await page.locator('input[type="text"] , input[type="email"], input:not([type])').first();
    const passwordInput = await page.locator('input[type="password"]').first();

    if (!textInput || !passwordInput) {
      // still continue, but attempt general selectors
    }

    try {
      if (textInput) await textInput.fill(account);
    } catch (e) {
      // ignore
    }

    try {
      if (passwordInput) await passwordInput.fill(password);
    } catch (e) {
      // ignore
    }

    // Try to submit: button[type=submit] or button with text '登入'
    const submit = page.locator('button[type="submit"], input[type="submit"], button:has-text("登入")').first();
    try {
      if (await submit.count()) {
        await submit.click({ timeout: 5000 });
      } else {
        // fallback: press Enter in password field
        if (passwordInput) await passwordInput.press('Enter');
      }
    } catch (e) {
      // ignore
    }

    // wait a bit for navigation or network
    try {
      await page.waitForLoadState('networkidle', { timeout: 8000 });
    } catch (e) {
      // networkidle may timeout; continue
    }

    const html = await page.content();

    await context.close();
    await browser.close();

    return { success: true, html };
  } catch (err: any) {
    if (browser) {
      try {
        await browser.close();
      } catch (e) {}
    }

    return { success: false, error: String(err?.message ?? err) };
  }
}

export default loginAndGetHtml;
