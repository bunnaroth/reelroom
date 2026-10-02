import { expect, test } from '@playwright/test'

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
}

test.describe('watchlist', () => {
  test('prompts guest users to sign in before saving', async ({ page }) => {
    await page.route('**/api/movies/popular', async (route) => {
      await route.fulfill({ status: 200, json: [movie] })
    })
    await page.route('**/api/watchlist*', async (route) => {
      await route.fulfill({ status: 200, json: [] })
    })

    await page.goto('/')
    await page.getByRole('button', { name: '+ Watchlist' }).click()

    await expect(page.locator('.auth-dialog')).toBeVisible()
  })

  test('signed-in users can add movies to My Watchlist', async ({ page }) => {
    let watchlist: Array<{
      id: number
      userId: number
      tmdbMovieId: number
      mediaType: string
      createdAt: string
      movie?: typeof movie
    }> = []

    await page.addInitScript(() => {
      localStorage.setItem('movie-app-token', 'watchlist-token')
      localStorage.setItem('movie-app-user', 'Ava')
    })
    await page.route('**/api/movies/popular', async (route) => {
      await route.fulfill({ status: 200, json: [movie] })
    })
    await page.route('**/api/watchlist*', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({ status: 200, json: watchlist })
        return
      }

      if (route.request().method() === 'POST') {
        watchlist = [{ id: 1, userId: 1, tmdbMovieId: movie.id, mediaType: 'movie', createdAt: '2025-01-01T00:00:00.000Z', movie }]
        await route.fulfill({ status: 201, json: { data: watchlist[0] } })
        return
      }

      if (route.request().method() === 'DELETE') {
        watchlist = []
        await route.fulfill({ status: 200, json: { message: 'Removed from watchlist' } })
      }
    })

    await page.goto('/')
    await page.getByRole('button', { name: '+ Watchlist' }).click()
    await expect(page.getByRole('button', { name: 'In watchlist' })).toBeVisible()
    await page.getByRole('button', { name: 'My Watchlist' }).click()

    await expect(page.getByRole('heading', { name: 'My Watchlist' })).toBeVisible()
    await expect(page.getByRole('heading', { name: movie.title })).toBeVisible()
  })
})
