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

test.describe('favorites and watchlist', () => {
  test('guest users are prompted to sign in before saving a movie', async ({ page }) => {
    await page.route('**/api/movies/popular', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([movie]),
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

    await page.goto('/');
    await page.getByRole('button', { name: /favorite fight club/i }).click();

    await expect(page.locator('.auth-dialog')).toBeVisible();
  });

  test('signed-in users can save favorites and add to the watchlist', async ({ page }) => {
    let favorites: typeof movie[] = [];
    let watchlist: { id: number; userId: number; tmdbMovieId: number; createdAt: string }[] = [];

    await page.addInitScript(() => {
      localStorage.setItem('movie-app-token', 'library-token');
      localStorage.setItem('movie-app-user', 'Ava');
    });

    await page.route('**/api/movies/popular', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([movie]),
      });
    });

    await page.route('**/api/favorites*', async route => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(favorites),
        });
        return;
      }

      favorites = [movie];
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ favorited: true }),
      });
    });

    await page.route('**/api/watchlist*', async route => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(watchlist),
        });
        return;
      }

      if (route.request().method() === 'POST') {
        watchlist = [{ id: 1, userId: 1, tmdbMovieId: movie.id, createdAt: '2025-01-01T00:00:00.000Z' }];
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: watchlist[0] }),
        });
        return;
      }

      if (route.request().method() === 'DELETE') {
        watchlist = [];
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Removed from watchlist' }),
        });
      }
    });

    await page.goto('/');

    await page.getByRole('button', { name: /favorite fight club/i }).click();
    await page.getByRole('button', { name: /\+ watchlist/i }).click();

    await expect(page.getByRole('button', { name: 'In watchlist' })).toBeVisible();

    await page.getByRole('button', { name: 'My library' }).click();

    await expect(page.getByRole('heading', { name: /saved films/i })).toBeVisible();
    await expect(page.getByText(/nothing here yet/i)).toBeVisible();
  });
});
