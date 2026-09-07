import type { CSSProperties, FormEvent } from 'react'
import type { Movie } from '../../types/movie'

interface MovieFeatureProps {
  movies: Movie[]
  favorites: Movie[]
  watchlist: number[]
  loading: boolean
  query: string
  activeView: 'discover' | 'saved'
  username: string
  onSearch: (event: FormEvent) => void
  onQueryChange: (value: string) => void
  onOpenMovie: (movie: Movie) => void
  onToggleFavorite: (movie: Movie) => void
  onToggleWatchlist: (movie: Movie) => void
  onChangeView: (view: 'discover' | 'saved') => void
  onOpenAuth: () => void
}

export function MovieFeature({
  movies,
  favorites,
  watchlist,
  loading,
  query,
  activeView,
  username,
  onSearch,
  onQueryChange,
  onOpenMovie,
  onToggleFavorite,
  onToggleWatchlist,
  onChangeView,
  onOpenAuth,
}: MovieFeatureProps) {
  const visibleMovies = activeView === 'saved' ? favorites : movies

  return (
    <>
      <header className="topbar">
        <a className="brand" href="/">REEL<span>ROOM</span></a>
        <nav className="nav-tabs" aria-label="Main navigation">
          <button className={activeView === 'discover' ? 'active' : ''} onClick={() => onChangeView('discover')}>Discover</button>
          <button className={activeView === 'saved' ? 'active' : ''} onClick={() => onChangeView('saved')}>My library</button>
        </nav>
        <button className="account-button" onClick={onOpenAuth}>{username} <span>↗</span></button>
      </header>

      <section className="hero-band">
        <div className="hero-copy">
          <p className="eyebrow">THE NIGHTLY SCREENING</p>
          <h1>Find your<br /><em>next favourite.</em></h1>
          <p className="hero-description">A considered collection of films worth your evening. Search the catalogue, save what calls to you, and leave a note for the next viewer.</p>
        </div>
        <form className="search-form" onSubmit={onSearch}>
          <input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Search films, directors, moods..." aria-label="Search movies" />
          <button type="submit" aria-label="Search">⌕</button>
        </form>
      </section>

      <section className="catalogue">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{activeView === 'saved' ? 'YOUR COLLECTION' : query ? 'SEARCH RESULTS' : 'CURATED FOR YOU'}</p>
            <h2>{activeView === 'saved' ? 'Saved films' : query ? `Films matching “${query}”` : 'Popular right now'}</h2>
          </div>
          <span className="count">{visibleMovies.length.toString().padStart(2, '0')} films</span>
        </div>
        {loading ? (
          <div className="empty-state">Loading the programme...</div>
        ) : visibleMovies.length === 0 ? (
          <div className="empty-state">Nothing here yet. Search for a film or save one from Discover.</div>
        ) : (
          <div className="movie-grid">
            {visibleMovies.map((movie, index) => (
              <article className="movie-card" key={movie.id} style={{ '--delay': `${index * 45}ms` } as CSSProperties}>
                <button className="poster-button" onClick={() => onOpenMovie(movie)} aria-label={`Open ${movie.title}`}>
                  <div className="poster-wrap">
                    {movie.posterPath ? <img src={movie.posterPath} alt={`${movie.title} poster`} /> : <div className="poster-placeholder">{movie.title}</div>}
                    <span className="movie-index">{String(index + 1).padStart(2, '0')}</span>
                  </div>
                </button>
                <div className="movie-meta">
                  <div>
                    <h3>{movie.title}</h3>
                    <p>{movie.releaseDate?.slice(0, 4) || 'Unknown'} <span>·</span> {movie.voteAverage.toFixed(1)} rating</p>
                  </div>
                  <button
                    className={favorites.some((item) => item.id === movie.id) ? 'icon-button saved' : 'icon-button'}
                    onClick={() => onToggleFavorite(movie)}
                    aria-label={`Favorite ${movie.title}`}
                  >
                    ♥
                  </button>
                </div>
                <button className={watchlist.includes(movie.id) ? 'watch-button added' : 'watch-button'} onClick={() => onToggleWatchlist(movie)}>
                  {watchlist.includes(movie.id) ? 'In watchlist' : '+ Watchlist'}
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  )
}
