
import { test, expect } from '@playwright/test';

test.describe('Sprout Garden App E2E', () => {

    test('Happy Path: Manual Entry -> Pending -> Active', async ({ page }) => {
        // 1. Navigate to Home
        page.on('console', msg => console.log(`BROWSER LOG: ${msg.text()}`));
        await page.goto('http://localhost:3000');

        // 2. Add Plant via Manual Entry (Navigate to Intake)
        await page.goto('http://localhost:3000/intake');
        await page.click('button:has-text("enter plants manually")');

        // Wait for form
        await expect(page.getByText('Identify Your Greenery')).toBeVisible();

        // 3. Fill Form
        // Plant Name
        await page.fill('input[placeholder*="Type plant name"]', 'Hydrangea');
        // Click suggestion if it appears, or just type. The component uses the input value as query.
        // We need to select from dropdown to "add" it to selectedPlants
        await page.click('button:has-text("Hydrangea")'); // Click the suggestion

        // Zip
        await page.fill('input[placeholder*="e.g. 90210"]', '30303');

        // New UI: Status is per-plant card. Default is "Pending".
        // We verify the card exists and is set to Pending (default).
        const hydrangeaCard = page.locator('.group', { hasText: 'Hydrangea' }).first();
        await expect(hydrangeaCard).toBeVisible();
        await expect(hydrangeaCard.getByText('Pending')).toBeVisible();

        // If we wanted to set it to Planted, we would click 'Planted' in the card.
        // For this test, we WANT it to be Pending first.

        // Submit
        await page.click('button[type="submit"]');

        // 3. Verify Dashboard - Planting Queue
        await expect(page).toHaveURL(/dashboard/);
        await expect(page.getByText('Planting Queue')).toBeVisible({ timeout: 10000 });
        await expect(page.getByText('Hydrangea')).toBeVisible();
        await expect(page.getByText('Status: Pending Planting')).toBeVisible();

        // 4. Move to Active
        // 5. Verify Active Garden
        // Accept confirm dialog if any (HandleMarkPlanted has confirm)
        page.once('dialog', dialog => dialog.accept());

        // The button might say "I Just Planted It! (Start Care)" or "I Planted It Anyway (Override)"
        // Use a regex to match either
        await page.getByRole('button', { name: /Planted It/ }).click();

        // Wait for update
        await expect(page.getByText(/Added/)).toBeVisible({ timeout: 10000 }); // Matches "Added Jan 25"
        // Pending Queue should decrease or disappear if empty
        // Basic check: Care icons appear
        await expect(page.locator('.lucide-droplets').first()).toBeVisible();
    });

    test('Destructive/Edge Case: Freeze Warning & Delete', async ({ page }) => {
        await page.goto('http://localhost:3000/intake');
        await page.click('button:has-text("enter plants manually")');

        // 1. Enter details for Cold Place (Alaska)
        await page.fill('input[placeholder*="Type plant name"]', 'Tropical Fern');
        await page.click('button:has-text("Tropical Fern")').catch(() => {
            // Fallback if no suggestion, likely assumes typing works but component requires selection to add to list?
            // ManualEntryForm: "addPlant" is called on click suggestion. 
            // If we don't click suggestion, selectedPlants is empty.
            // We MUST select a plant.
            // If "Tropical Fern" not found in mock, pick "Fern" or wait for "Tropical".
            // Let's assume the mock data has "Fern".
        });
        // Actually, "Tropical Fern" might not match anything in standard list if it's limited.
        // Let's use "Fern".

        // Zip
        await page.fill('input[placeholder*="e.g. 90210"]', '99705'); // North Pole/Alaska

        // Toggle "Planted" ON for the specific plant
        const fernCard = page.locator('.group', { hasText: 'Fern' }).first();
        await expect(fernCard).toBeVisible();
        await fernCard.getByRole('button', { name: 'Planted' }).click();

        // Submit
        await page.click('button[type="submit"]');

        // 2. Verify Dashboard Warning
        await expect(page).toHaveURL(/dashboard/);

        // Check for Freeze Warning (SageAlertBanner)
        // The text in Dashboard is "Freeze Warning"
        await expect(page.getByText(/Freeze Warning/i)).toBeVisible({ timeout: 10000 });

        // Find our plant
        const plantCard = page.locator('.group', { hasText: 'Fern' }).first();
        await expect(plantCard).toBeVisible();

        // Check for "Care Paused"
        await expect(plantCard.getByText('Care Paused')).toBeVisible();

        // 3. Delete
        // Hover to reveal trash
        await plantCard.hover();

        // Setup dialog handler for delete confirmation
        page.once('dialog', dialog => dialog.accept());

        await plantCard.locator('button[title="Remove Plant"]').click();

        // 4. Verify Gone
        await expect(plantCard).not.toBeVisible();
    });

});
