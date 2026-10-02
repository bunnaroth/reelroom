import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { api } from '../../services/api'
import type { DiscoverMoviePage, Movie } from '../../types/movie'
import { DiscoverFeature } from './DiscoverFeature'

vi.mock('../../services/api', () => ({
  api: {
    getDiscoverMovies: vi.fn(),
  },
}))

const sampleMovie = (id: number, title: string, mediaType: Movie['mediaType'] = 'movie'): Movie => ({
  id,
  mediaType,
  title,
  overview: null,
  posterPath: null,
  backdropPath: null,
  releaseDate: '2026-01-01',
  voteAverage: 7.5,
  voteCount: 10,
  popularity: 20,
  genreIds: [],
})

const moviePage = (movies: Movie[], page = 1, totalPages = 1): DiscoverMoviePage => ({ movies, page, totalPages })

function CurrentLocation() {
  const location = useLocation()
  return <output aria-label="Current URL">{location.pathname}{location.search}</output>
}

const renderDiscover = (initialEntry = '/discover') => render(
  <MemoryRouter initialEntries={[initialEntry]}>
    <DiscoverFeature
      watchlist={[]}
      onOpenMovie={vi.fn()}
      onToggleWatchlist={vi.fn()}
    />
    <CurrentLocation />
  </MemoryRouter>,
)

describe('DiscoverFeature', () => {
  const getDiscoverMovies = vi.mocked(api.getDiscoverMovies)

  beforeEach(() => {
    vi.clearAllMocks()
    getDiscoverMovies.mockResolvedValue(moviePage([sampleMovie(1, 'Trending title')]))
  })

  afterEach(cleanup)

  it('loads trending movies in the default All category', async () => {
    renderDiscover()

    expect(await screen.findByRole('heading', { name: 'Trending Movies & Series' })).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'Trending title' })).toBeInTheDocument()
    expect(getDiscoverMovies).toHaveBeenCalledWith('all', 1, expect.any(AbortSignal))
  })

  it('selects the category from the URL and updates it when filters change', async () => {
    renderDiscover('/discover?category=c-drama')

    expect(await screen.findByRole('heading', { name: 'C-Drama Series' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'C-Drama' })).toHaveAttribute('aria-pressed', 'true')
    expect(getDiscoverMovies).toHaveBeenCalledWith('c-drama', 1, expect.any(AbortSignal))

    fireEvent.click(screen.getByRole('button', { name: 'Animation' }))
    expect(await screen.findByRole('heading', { name: 'Animation Movies' })).toBeInTheDocument()
    expect(screen.getByLabelText('Current URL')).toHaveTextContent('/discover?category=animation')
  })

  it('fetches the selected category and ignores a stale response', async () => {
    let resolveTrending!: (result: DiscoverMoviePage) => void
    const onOpenMovie = vi.fn()
    const onToggleWatchlist = vi.fn()
    getDiscoverMovies.mockImplementation((category) => category === 'all'
      ? new Promise<DiscoverMoviePage>((resolve) => { resolveTrending = resolve })
      : Promise.resolve(moviePage([sampleMovie(2, 'K-drama title', 'tv')])) )

    render(
      <MemoryRouter>
        <DiscoverFeature
          watchlist={[]}
          onOpenMovie={onOpenMovie}
          onToggleWatchlist={onToggleWatchlist}
        />
      </MemoryRouter>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'K-Drama' }))

    expect(await screen.findByRole('heading', { name: 'K-Drama Series' })).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'K-drama title' })).toBeInTheDocument()
    expect(screen.getByText(/TV series/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Open K-drama title' }))
    fireEvent.click(screen.getByRole('button', { name: '+ Watchlist' }))
    expect(onOpenMovie).toHaveBeenCalledWith(expect.objectContaining({ id: 2, mediaType: 'tv' }))
    expect(onToggleWatchlist).toHaveBeenCalledWith(expect.objectContaining({ id: 2, mediaType: 'tv' }))
    expect(getDiscoverMovies).toHaveBeenLastCalledWith('k-drama', 1, expect.any(AbortSignal))

    resolveTrending(moviePage([sampleMovie(3, 'Stale title')]))
    await waitFor(() => expect(screen.queryByRole('heading', { name: 'Stale title' })).not.toBeInTheDocument())
  })

  it('offers retry after an error and displays the empty state for an empty response', async () => {
    getDiscoverMovies
      .mockRejectedValueOnce(new Error('Request failed'))
      .mockResolvedValueOnce(moviePage([]))

    renderDiscover()

    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to load movies.Try again')
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(await screen.findByText('No movies found for this category.')).toBeInTheDocument()
    expect(getDiscoverMovies).toHaveBeenCalledTimes(2)
  })

  it('appends the next page and hides Load more after the last page', async () => {
    getDiscoverMovies
      .mockResolvedValueOnce(moviePage([sampleMovie(1, 'First page title')], 1, 2))
      .mockResolvedValueOnce(moviePage([sampleMovie(2, 'Second page title')], 2, 2))

    renderDiscover()

    expect(await screen.findByRole('heading', { name: 'First page title' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Load more' }))

    expect(await screen.findByRole('heading', { name: 'Second page title' })).toBeInTheDocument()
    expect(getDiscoverMovies).toHaveBeenLastCalledWith('all', 2, expect.any(AbortSignal))
    expect(screen.queryByRole('button', { name: 'Load more' })).not.toBeInTheDocument()
  })

})