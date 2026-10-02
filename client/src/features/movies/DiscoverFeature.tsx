import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { MovieCard } from '../../components/MovieCard'
import { api } from '../../services/api'
import type { DiscoverCategory, Movie, WatchlistItem } from '../../types/movie'

interface DiscoverFeatureProps {
  watchlist: WatchlistItem[]
  onOpenMovie: (movie: Movie) => void
  onToggleWatchlist: (movie: Movie) => void
}

const categories: { id: DiscoverCategory; label: string; heading: string }[] = [
  { id: 'all', label: 'All', heading: 'Trending Movies & Series' },
  { id: 'hollywood', label: 'Hollywood', heading: 'Hollywood Movies' },
  { id: 'animation', label: 'Animation', heading: 'Animation Movies' },
  { id: 'c-drama', label: 'C-Drama', heading: 'C-Drama Series' },
  { id: 'k-drama', label: 'K-Drama', heading: 'K-Drama Series' },
]

const getCategoryFromUrl = (value: string | null): DiscoverCategory =>
  categories.find((item) => item.id === value)?.id ?? 'all'

export function DiscoverFeature({
  watchlist,
  onOpenMovie,
  onToggleWatchlist,
}: DiscoverFeatureProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const category = getCategoryFromUrl(searchParams.get('category'))
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [loadedCategory, setLoadedCategory] = useState<DiscoverCategory | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [loadMoreError, setLoadMoreError] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [retryKey, setRetryKey] = useState(0)
  const activeRequest = useRef<AbortController | null>(null)
  const selectedCategory = categories.find((item) => item.id === category)!
  const isLoading = loading || loadedCategory !== category
  const contentType = category === 'all' ? 'movies and series' : category === 'k-drama' || category === 'c-drama' ? 'series' : 'movies'

  function selectCategory(nextCategory: DiscoverCategory) {
    if (nextCategory === category) {
      return
    }

    setLoading(true)
    setLoadingMore(false)
    setHasError(false)
    setLoadMoreError(false)
    setMovies([])
    setPage(1)
    setTotalPages(1)
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      next.set('category', nextCategory)
      return next
    })
  }

  function retryCategory() {
    activeRequest.current?.abort()
    setLoading(true)
    setHasError(false)
    setLoadingMore(false)
    setLoadMoreError(false)
    setMovies([])
    setPage(1)
    setTotalPages(1)
    setRetryKey((current) => current + 1)
  }

  useEffect(() => {
    activeRequest.current?.abort()
    const controller = new AbortController()
    activeRequest.current = controller

    void api.getDiscoverMovies(category, 1, controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) {
          setHasError(false)
          setLoadMoreError(false)
          setMovies(result.movies)
          setPage(result.page)
          setTotalPages(result.totalPages)
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setHasError(true)
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoadedCategory(category)
          setLoading(false)
          if (activeRequest.current === controller) {
            activeRequest.current = null
          }
        }
      })

    return () => {
      controller.abort()
      activeRequest.current?.abort()
    }
  }, [category, retryKey])

  async function loadMore() {
    if (isLoading || loadingMore || page >= totalPages) {
      return
    }

    const controller = new AbortController()
    activeRequest.current?.abort()
    activeRequest.current = controller
    setLoadingMore(true)
    setLoadMoreError(false)

    try {
      const result = await api.getDiscoverMovies(category, page + 1, controller.signal)
      if (!controller.signal.aborted) {
        setMovies((current) => {
          const existingIds = new Set(current.map((movie) => `${movie.mediaType || 'movie'}:${movie.id}`))
          return [...current, ...result.movies
            .filter((movie) => !existingIds.has(`${movie.mediaType || 'movie'}:${movie.id}`))]
        })
        setPage(result.page)
        setTotalPages(result.totalPages)
      }
    } catch {
      if (!controller.signal.aborted) {
        setLoadMoreError(true)
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoadingMore(false)
        if (activeRequest.current === controller) {
          activeRequest.current = null
        }
      }
    }
  }

  return (
    <section className="catalogue discover-page">
      <div className="discover-intro">
        <p className="eyebrow">A WORLD OF FILM</p>
        <h1>Discover</h1>
        <p>Explore films and series worth watching.</p>
      </div>
      <div className="discover-filters" role="group" aria-label="Discover categories">
        {categories.map((item) => (
          <button
            key={item.id}
            className={category === item.id ? 'discover-filter active' : 'discover-filter'}
            aria-pressed={category === item.id}
            onClick={() => selectCategory(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="section-heading">
        <h2>{selectedCategory.heading}</h2>
      </div>
      {isLoading ? (
        <div className="empty-state" role="status">Loading {contentType}...</div>
      ) : hasError ? (
        <div className="discover-feedback" role="alert">
          <p>Unable to load movies.</p>
          <button className="primary-button" onClick={retryCategory}>Try again</button>
        </div>
      ) : movies.length === 0 ? (
        <div className="empty-state">No movies found for this category.</div>
      ) : (
        <>
          <div className="movie-grid">
            {movies.map((movie, index) => (
              <MovieCard
                key={`${category}-${movie.id}`}
                movie={movie}
                index={index}
                isWatchlisted={watchlist.some((item) => item.tmdbMovieId === movie.id && (item.mediaType || 'movie') === (movie.mediaType || 'movie'))}
                onOpen={onOpenMovie}
                onToggleWatchlist={onToggleWatchlist}
              />
            ))}
          </div>
          {page < totalPages && (
            <div className="discover-load-more">
              {loadMoreError && <p role="alert">Unable to load movies.</p>}
              <button className="primary-button" onClick={loadMore} disabled={loadingMore}>
                {loadingMore ? 'Loading...' : loadMoreError ? 'Try again' : 'Load more'}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  )
}