import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { api } from '../../services/api'
import type { HomeMovieSections, Movie } from '../../types/movie'
import { HomeFeature } from './HomeFeature'

vi.mock('../../services/api', () => ({
  api: {
    getHomeMovies: vi.fn(),
    searchMovies: vi.fn(),
  },
}))

const movie = (id: number, title: string): Movie => ({
  id,
  mediaType: 'movie',
  title,
  overview: null,
  posterPath: null,
  backdropPath: null,
  releaseDate: '2026-01-01',
  voteAverage: 7,
  voteCount: 10,
  popularity: 10,
  genreIds: [],
})

const homeMovies: HomeMovieSections = {
  popular: Array.from({ length: 6 }, (_, index) => movie(index + 1, `Popular ${index + 1}`)),
  animation: Array.from({ length: 6 }, (_, index) => movie(index + 11, `Animation ${index + 1}`)),
  hollywood: Array.from({ length: 6 }, (_, index) => movie(index + 21, `Hollywood ${index + 1}`)),
  kDrama: Array.from({ length: 6 }, (_, index) => movie(index + 31, `K-Drama ${index + 1}`)),
  cDrama: Array.from({ length: 6 }, (_, index) => movie(index + 41, `C-Drama ${index + 1}`)),
}

function CurrentLocation() {
  const location = useLocation()
  return <output aria-label="Current URL">{location.pathname}{location.search}</output>
}

function renderHome() {
  return render(
    <MemoryRouter>
      <HomeFeature watchlist={[]} onOpenMovie={vi.fn()} onToggleWatchlist={vi.fn()} />
      <CurrentLocation />
    </MemoryRouter>,
  )
}

describe('HomeFeature', () => {
  const getHomeMovies = vi.mocked(api.getHomeMovies)

  beforeEach(() => {
    vi.clearAllMocks()
    getHomeMovies.mockResolvedValue(homeMovies)
  })

  afterEach(cleanup)

  it('shows at most four movies per section and links each View All to its category', async () => {
    const { container } = renderHome()

    expect(await screen.findByRole('heading', { name: 'Popular Right Now' })).toBeInTheDocument()
    const sections = container.querySelectorAll('.home-section[aria-labelledby^="home-"]')
    expect(sections).toHaveLength(5)
    for (const section of sections) {
      expect(within(section as HTMLElement).getAllByRole('article')).toHaveLength(4)
    }

    expect(screen.getAllByRole('link', { name: 'View All' }).map((link) => link.getAttribute('href'))).toEqual([
      '/discover?category=all',
      '/discover?category=animation',
      '/discover?category=hollywood',
      '/discover?category=k-drama',
      '/discover?category=c-drama',
    ])

    fireEvent.click(screen.getAllByRole('link', { name: 'View All' })[1])
    expect(screen.getByLabelText('Current URL')).toHaveTextContent('/discover?category=animation')
  })

  it('shows loading, retry, and category-specific empty states', async () => {
    getHomeMovies.mockReturnValueOnce(new Promise<HomeMovieSections>(() => undefined))
    const { unmount } = renderHome()

    expect(screen.getByText('Loading movies...')).toHaveAttribute('role', 'status')
    expect(screen.queryByText('No movies found for this category.')).not.toBeInTheDocument()
    unmount()

    getHomeMovies
      .mockRejectedValueOnce(new Error('Request failed'))
      .mockResolvedValueOnce({ popular: [], animation: [], hollywood: [], kDrama: [], cDrama: [] })
    renderHome()

    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to load movies. Please try again.')
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(await screen.findAllByText('No movies found for this category.')).toHaveLength(5)
  })
})
