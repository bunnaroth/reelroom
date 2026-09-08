import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{
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
      }],
    }))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders the movie discovery experience', async () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: /find your/i })).toBeInTheDocument()
    expect((await screen.findAllByText('Fight Club'))[1]).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /favorite fight club/i })).toBeInTheDocument()
  })
})