import type { FormEvent } from 'react'
import { MovieCard } from '../../components/MovieCard'
import type { Movie, WatchlistItem } from '../../types/movie'

interface MovieFeatureProps {
  movies: Movie[]
  watchlist: WatchlistItem[]
  loading: boolean
  query: string
  activeView: 'discover' | 'watchlist'
  onSearch: (event: FormEvent) => void
  onQueryChange: (value: string) => void
  onOpenMovie: (movie: Movie) => void
  onToggleWatchlist: (movie: Movie) => void
}

export function MovieFeature({
  movies,
  watchlist,
  loading,
  query,
  activeView,
  onSearch,
  onQueryChange,
  onOpenMovie,
  onToggleWatchlist,
}: MovieFeatureProps) {
  const visibleMovies = activeView === 'watchlist'
    ? watchlist.flatMap((item) => item.movie ? [item.movie] : [])
      .filter((movie, index, watchlistMovies) =>
        watchlistMovies.findIndex((watchlistMovie) =>
          watchlistMovie.id === movie.id && (watchlistMovie.mediaType || 'movie') === (movie.mediaType || 'movie')) === index)
    : movies

  return (
    <>
      <section className="hero-band">
        <div className="hero-copy">
          <p className="eyebrow">THE NIGHTLY SCREENING</p>
          <h1>Find your<br /><em>next favourite.</em></h1>
          <p className="hero-description">A considered collection of films worth your evening. Search the catalogue, save what calls to you, and leave a note for the next viewer.</p>
        </div>
        <form className="search-form" onSubmit={onSearch}>
          <input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Search films..." aria-label="Search movies" />
          <button type="submit" aria-label="Search">⌕</button>
        </form>
      </section>

      <section className="catalogue">
        <div className="section-heading">
          <div>
            <h2>{activeView === 'watchlist' ? 'My Watchlist' : query ? `Films matching “${query}”` : 'Popular right now'}</h2>
          </div>
        </div>
        {loading ? (
          <div className="empty-state">Loading...</div>
        ) : visibleMovies.length === 0 ? (
          <div className="empty-state">Your watchlist is empty.</div>
        ) : (
          <div className="movie-grid">
            {visibleMovies.map((movie, index) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                index={index}
                isWatchlisted={watchlist.some((item) => item.tmdbMovieId === movie.id && (item.mediaType || 'movie') === (movie.mediaType || 'movie'))}
                onOpen={onOpenMovie}
                onToggleWatchlist={onToggleWatchlist}
              />
            ))}
          </div>
        )}
      </section>
    </>
  )
}