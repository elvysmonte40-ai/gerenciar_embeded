import { test, expect } from '@playwright/test';

test('landing page loads and has email input', async ({ page }) => {
    console.log('Navigating to home...');
    await page.goto('/');

    console.log('Checking title...');
    await expect(page).toHaveTitle(/Bem-vindo/);

    console.log('Checking email input...');
    const emailInput = page.locator('input[name="email"]');
    await expect(emailInput).toBeVisible();

    console.log('Checking form functionality...');
    const testEmail = 'validacao@playwright.com';
    await emailInput.fill(testEmail);
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/register/);
    const registerInput = page.locator('#email-address');
    await expect(registerInput).toHaveValue(testEmail);
});
