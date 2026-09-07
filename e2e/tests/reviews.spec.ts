import { expect, test } from '@playwright/test';

const movie = {
  id: 550,
  title: 'Fight Club',
  overview: 'An underground fight club forms.',
  posterPath: null,
  backdropPath: null,
  releaseDate: '1999-10-15',
  voteAverage: 8.4,
  voteCount: 1000,
  popularity: 80,
  genreIds: [],
};

test.describe('reviews', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('movie-app-token', 'review-token');
      localStorage.setItem('movie-app-user', 'Ava');
    });

    await page.route('**/api/movies/popular', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([movie]),
      });
    });

    await page.route('**/api/reviews/movie/550', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 1,
            userId: 1,
            username: 'Ava',
            rating: 5,
            content: 'A razor-sharp, unforgettable watch.',
            createdAt: '2025-01-01T00:00:00.000Z',
          },
        ]),
      });
    });

    await page.route('**/api/reviews', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              id: 2,
              userId: 1,
              username: 'Ava',
              rating: 4,
              content: 'A brilliant watch with a devastating ending.',
              createdAt: '2025-01-02T00:00:00.000Z',
            },
          }),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
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
  });

  test('user can open a movie and publish a review', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: /open fight club/i }).click();

    await expect(page.getByText('A razor-sharp, unforgettable watch.')).toBeVisible();
    await expect(page.getByText('1 reviews')).toBeVisible();

    const dialog = page.locator('.movie-dialog');
    await dialog.getByLabel('Leave your rating').selectOption('4');
    await dialog.getByPlaceholder('What stayed with you?').fill('A brilliant watch with a devastating ending.');
    await dialog.getByRole('button', { name: 'Publish review' }).click();

    await expect(page.getByText('A brilliant watch with a devastating ending.')).toBeVisible();
  });
});
