import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import type { Movie } from './types/movie'

const movie: Movie = {
  id: 550,
  title: 'Fight Club',
  overview: 'A test movie',
  posterPath: null,
  backdropPath: null,
  releaseDate: '1999-10-15',
  voteAverage: 8.4,
  voteCount: 1000,
  popularity: 80,
  genreIds: [],
}

const tvMovie: Movie = { ...movie, mediaType: 'tv', title: 'Squid Game' }
type TestMovie = Movie

function mockAuthenticatedApi(discoverMovie: TestMovie = movie) {
  const watchlist: Array<{
    id: number
    userId: number
    tmdbMovieId: number
    mediaType: string
    createdAt: string
    movie?: TestMovie
  }> = []

  vi.mocked(fetch).mockImplementation(async (input, init) => {
    const path = new URL(String(input), 'http://localhost').pathname
    let body: unknown = []

    if (path === '/api/movies/discover') {
      body = { movies: [discoverMovie], page: 1, totalPages: 1 }
    } else if (path === '/api/watchlist' && init?.method === 'POST') {
      const item = {
        id: 1,
        userId: 1,
        tmdbMovieId: discoverMovie.id,
        mediaType: discoverMovie.mediaType || 'movie',
        createdAt: '2026-01-01',
        movie: discoverMovie,
      }
      watchlist.push(item)
      body = { data: item }
    } else if (path === '/api/watchlist') {
      body = watchlist
    } else if (path === '/api/reviews' && init?.method === 'POST') {
      const payload = JSON.parse(String(init.body)) as { tmdbMovieId: number; mediaType: string; rating: number; content: string }
      body = {
        data: {
          id: 2,
          userId: 1,
          username: 'tester',
          ...payload,
          createdAt: '2026-01-01',
        },
      }
    } else if (path === '/api/auth/login') {
      body = { token: 'test-token', user: { id: 1, username: 'tester' } }
    }

    return { ok: true, json: async () => body } as Response
  })
}

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.stubGlobal('fetch', vi.fn().mockImplementation((input: RequestInfo | URL) => Promise.resolve({
      ok: true,
      json: async () => String(input).includes('/movies/discover')
        ? { movies: [movie], page: 1, totalPages: 1 }
        : String(input).includes('/movies/home')
          ? { popular: [movie], animation: [], hollywood: [], kDrama: [], cDrama: [] }
          : [movie],
    })))
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('renders discovery with the watchlist save button', async () => {
    render(<MemoryRouter><App /></MemoryRouter>)

    expect(screen.getByRole('heading', { name: /find your/i })).toBeInTheDocument()
    expect((await screen.findAllByText('Fight Club'))[1]).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '+ Watchlist' })).toBeInTheDocument()
  })

  it('opens Discover from navigation and requests the default category', async () => {
    render(<MemoryRouter><App /></MemoryRouter>)

    fireEvent.click(screen.getByRole('button', { name: 'Discover' }))

    expect(await screen.findByRole('heading', { name: 'Trending Movies & Series' })).toBeInTheDocument()
    expect(fetch).toHaveBeenCalledWith(
      '/api/movies/discover?category=all&page=1',
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    )
  })

  it('adds watchlist movies to My Watchlist and toggles the saved state', async () => {
    localStorage.setItem('movie-app-token', 'test-token')
    localStorage.setItem('movie-app-user', 'tester')
    mockAuthenticatedApi()
    render(<MemoryRouter initialEntries={['/discover']}><App /></MemoryRouter>)

    await screen.findByRole('heading', { name: 'Fight Club' })
    fireEvent.click(screen.getByRole('button', { name: '+ Watchlist' }))
    expect(await screen.findByRole('button', { name: 'In watchlist' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'In watchlist' })).toHaveClass('added')
    fireEvent.click(screen.getByRole('button', { name: 'My Watchlist' }))

    expect(await screen.findByRole('heading', { name: 'My Watchlist' })).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'Fight Club' })).toBeInTheDocument()
    expect(fetch).toHaveBeenCalledWith('/api/watchlist', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ tmdbMovieId: movie.id, mediaType: 'movie' }),
    }))
  })

  it('completes a watchlist save after signing in', async () => {
    mockAuthenticatedApi()
    render(<MemoryRouter initialEntries={['/discover']}><App /></MemoryRouter>)

    await screen.findByRole('heading', { name: 'Fight Club' })
    fireEvent.click(screen.getByRole('button', { name: '+ Watchlist' }))
    expect(await screen.findByRole('heading', { name: 'Welcome back' })).toBeInTheDocument()
    expect(screen.getByText('Sign in to save this title. It will be added after you sign in.')).toBeInTheDocument()
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'tester@example.com' } })
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password' } })
    fireEvent.click(screen.getAllByRole('button', { name: 'Sign in' })[1])

    expect(await screen.findByRole('button', { name: 'In watchlist' })).toHaveAttribute('aria-pressed', 'true')
    const saveRequest = vi.mocked(fetch).mock.calls.find(([input, init]) =>
      String(input) === '/api/watchlist' && init?.method === 'POST')
    expect(new Headers(saveRequest?.[1]?.headers).get('Authorization')).toBe('Bearer test-token')
  })

  it('shows the same review section for a K-Drama title', async () => {
    localStorage.setItem('movie-app-token', 'test-token')
    localStorage.setItem('movie-app-user', 'tester')
    mockAuthenticatedApi(tvMovie)
    render(<MemoryRouter initialEntries={['/discover']}><App /></MemoryRouter>)

    await screen.findByRole('heading', { name: 'Squid Game' })
    fireEvent.click(screen.getByRole('button', { name: 'Open Squid Game' }))

    expect(await screen.findByText('THE AUDIENCE')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Publish review' })).toBeInTheDocument()
    expect(fetch).toHaveBeenCalledWith('/api/reviews/movie/550?mediaType=tv', expect.any(Object))
  })

  it('publishes the selected rating and displays the new review', async () => {
    localStorage.setItem('movie-app-token', 'test-token')
    localStorage.setItem('movie-app-user', 'tester')
    mockAuthenticatedApi()
    render(<MemoryRouter initialEntries={['/discover']}><App /></MemoryRouter>)

    await screen.findByRole('heading', { name: 'Fight Club' })
    fireEvent.click(screen.getByRole('button', { name: 'Open Fight Club' }))
    fireEvent.click(await screen.findByRole('button', { name: '3 stars' }))
    fireEvent.change(screen.getByPlaceholderText('What stayed with you?'), {
      target: { value: 'Worth a second watch.' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Publish review' }))

    expect(await screen.findByText('Worth a second watch.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '5 stars' })).toHaveAttribute('aria-pressed', 'true')
    expect(fetch).toHaveBeenCalledWith('/api/reviews', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({
        tmdbMovieId: movie.id,
        rating: 3,
        content: 'Worth a second watch.',
        mediaType: 'movie',
      }),
    }))
  })
})
