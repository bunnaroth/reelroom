import { expect, test } from '@playwright/test';

const popularMovies = [
  {
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
  },
  {
    id: 603,
    title: 'The Matrix',
    overview: 'A hacker learns the truth.',
    posterPath: null,
    backdropPath: null,
    releaseDate: '1999-03-31',
    voteAverage: 8.7,
    voteCount: 2000,
    popularity: 90,
    genreIds: [],
  },
];

test.describe('movie discovery', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/movies/popular', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(popularMovies),
      });
    });

    await page.route('**/api/movies/search*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([popularMovies[1]]),
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

  test('displays popular movies and supports search', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: /popular right now/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /open fight club/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /open the matrix/i })).toBeVisible();

    await page.getByLabel('Search movies').fill('matrix');
    await page.getByRole('button', { name: 'Search' }).click();

    await expect(page.getByText(/films matching.*matrix/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /open the matrix/i })).toBeVisible();
  });
});
