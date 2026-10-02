import type { CSSProperties } from 'react'
import type { Movie } from '../types/movie'

interface MovieCardProps {
  movie: Movie
  index: number
  isWatchlisted: boolean
  onOpen: (movie: Movie) => void
  onToggleWatchlist: (movie: Movie) => void
}

export function MovieCard({
  movie,
  index,
  isWatchlisted,
  onOpen,
  onToggleWatchlist,
}: MovieCardProps) {
  const poster = (
    <div className="poster-wrap">
      {movie.posterPath ? <img src={movie.posterPath} alt={`${movie.title} poster`} /> : <div className="poster-placeholder">{movie.title}</div>}
      <span className="movie-index">{String(index + 1).padStart(2, '0')}</span>
    </div>
  )

  return (
    <article className="movie-card" style={{ '--delay': `${Math.min(index * 45, 270)}ms` } as CSSProperties}>
      <button className="poster-button" onClick={() => onOpen(movie)} aria-label={`Open ${movie.title}`}>
        {poster}
      </button>
      <div className="movie-meta">
        <div>
          <h3>{movie.title}</h3>
          <p>
            {movie.releaseDate?.slice(0, 4) || 'Unknown'} <span>·</span> {movie.voteAverage.toFixed(1)} rating
            {movie.mediaType === 'tv' && <> <span>·</span> TV series</>}
          </p>
        </div>
      </div>
      <button
        className={isWatchlisted ? 'watch-button added' : 'watch-button'}
        onClick={() => onToggleWatchlist(movie)}
        aria-pressed={isWatchlisted}
      >
        {isWatchlisted ? 'In watchlist' : '+ Watchlist'}
      </button>
    </article>
  )
}