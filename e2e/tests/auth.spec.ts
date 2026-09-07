import { expect, test } from '@playwright/test';

const moviePayload = [{
  id: 550,
  title: 'Fight Club',
  overview: 'An insomniac office worker and a devil-may-care soapmaker form an underground fight club.',
  posterPath: null,
  backdropPath: null,
  releaseDate: '1999-10-15',
  voteAverage: 8.4,
  voteCount: 1000,
  popularity: 80,
  genreIds: [],
}];

test.describe('authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/movies/popular', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(moviePayload),
      });
    });

    await page.route('**/api/favorites*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.route('**/api/watchlist*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.route('**/api/auth/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: { id: 1, username: 'Ava', email: 'ava@example.com', role: 'user' },
          token: 'token-ava',
        }),
      });
    });

    await page.route('**/api/auth/register', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: { id: 2, username: 'Nova', email: 'nova@example.com', role: 'user' },
          token: 'token-nova',
        }),
      });
    });
  });

  test('user can sign in', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: 'Sign in' }).click();

    const dialog = page.locator('.auth-dialog');
    await dialog.getByPlaceholder('Email').fill('ava@example.com');
    await dialog.getByPlaceholder('Password').fill('secret123');
    await dialog.getByRole('button', { name: 'Sign in' }).click();

    await expect(page.getByText('Welcome back, Ava')).toBeVisible();
    await expect(page.locator('.account-button')).toContainText('Ava');
  });

  test('user can create an account', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.getByRole('button', { name: 'New here? Create an account' }).click();

    const dialog = page.locator('.auth-dialog');
    await dialog.getByPlaceholder('Username').fill('Nova');
    await dialog.getByPlaceholder('Email').fill('nova@example.com');
    await dialog.getByPlaceholder('Password').fill('secret123');
    await dialog.getByRole('button', { name: 'Register' }).click();

    await expect(page.getByText('Welcome back, Nova')).toBeVisible();
    await expect(page.locator('.account-button')).toContainText('Nova');
  });
});
