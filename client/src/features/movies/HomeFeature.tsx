import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { MovieCard } from '../../components/MovieCard'
import { api } from '../../services/api'
import type { DiscoverCategory, HomeMovieSections, Movie, WatchlistItem } from '../../types/movie'

interface HomeFeatureProps {
  watchlist: WatchlistItem[]
  onOpenMovie: (movie: Movie) => void
  onToggleWatchlist: (movie: Movie) => void
}

const sections: { key: keyof HomeMovieSections; category: DiscoverCategory; title: string }[] = [
  { key: 'popular', category: 'all', title: 'Popular Right Now' },
  { key: 'animation', category: 'animation', title: 'Animation' },
  { key: 'hollywood', category: 'hollywood', title: 'Hollywood' },
  { key: 'kDrama', category: 'k-drama', title: 'K-Drama' },
  { key: 'cDrama', category: 'c-drama', title: 'C-Drama' },
]

export function HomeFeature({ watchlist, onOpenMovie, onToggleWatchlist }: HomeFeatureProps) {
  const [sectionsData, setSectionsData] = useState<HomeMovieSections | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [retryKey, setRetryKey] = useState(0)
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Movie[]>([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState(false)
  const [searchSubmitted, setSearchSubmitted] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    void api.getHomeMovies(controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) {
          setSectionsData(result)
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setHasError(true)
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      })

    return () => controller.abort()
  }, [retryKey])

  async function submitSearch(searchTerm: string) {
    if (!searchTerm) {
      setSearchSubmitted(false)
      return
    }

    setSearchSubmitted(true)
    setSearching(true)
    setSearchError(false)
    try {
      setSearchResults(await api.searchMovies(searchTerm))
    } catch {
      setSearchError(true)
    } finally {
      setSearching(false)
    }
  }

  function handleSearch(event: FormEvent) {
    event.preventDefault()
    void submitSearch(query.trim())
  }

  return (
    <>
      <section className="hero-band">
        <div className="hero-copy">
          <p className="eyebrow">THE NIGHTLY SCREENING</p>
          <h1>Find your<br /><em>next favourite.</em></h1>
          <p className="hero-description">A considered collection of films worth your evening. Search the catalogue, save what calls to you, and leave a note for the next viewer.</p>
        </div>
        <form className="search-form" onSubmit={handleSearch}>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search films..." aria-label="Search movies" />
          <button type="submit" aria-label="Search">⌕</button>
        </form>
      </section>

      {searchSubmitted && (
        <section className="catalogue home-section" aria-labelledby="search-results-heading">
          <div className="section-heading"><h2 id="search-results-heading">Films matching “{query.trim()}”</h2></div>
          {searching ? (
            <div className="empty-state" role="status">Searching movies...</div>
          ) : searchError ? (
            <div className="discover-feedback" role="alert">
              <p>Unable to load movies. Please try again.</p>
              <button className="primary-button" onClick={() => void submitSearch(query.trim())}>Try again</button>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="empty-state">No movies found.</div>
          ) : (
            <div className="movie-grid">
              {searchResults.map((movie, index) => (
                <MovieCard
                  key={`${movie.mediaType || 'movie'}-${movie.id}`}
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
      )}

      <div className="home-sections">
        {loading ? (
          <div className="empty-state" role="status">Loading movies...</div>
        ) : hasError || !sectionsData ? (
          <div className="discover-feedback" role="alert">
            <p>Unable to load movies. Please try again.</p>
            <button
              className="primary-button"
              onClick={() => {
                setLoading(true)
                setHasError(false)
                setRetryKey((current) => current + 1)
              }}
            >
              Try again
            </button>
          </div>
        ) : sections.map((section) => {
          const movies = sectionsData[section.key].slice(0, 4)
          return (
            <section className="catalogue home-section" key={section.key} aria-labelledby={`home-${section.key}-heading`}>
              <div className="section-heading">
                <h2 id={`home-${section.key}-heading`}>{section.title}</h2>
                <Link className="primary-button" to={`/discover?category=${section.category}`}>View All</Link>
              </div>
              {movies.length === 0 ? (
                <div className="empty-state">No movies found for this category.</div>
              ) : (
                <div className="movie-grid">
                  {movies.map((movie, index) => (
                    <MovieCard
                      key={`${movie.mediaType || 'movie'}-${movie.id}`}
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
          )
        })}
      </div>
    </>
  )
}
