import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useLocation } from 'react-router-dom'
import { AppNavigation } from './components/AppNavigation'
import { AuthFeature } from './features/auth/AuthFeature'
import { DiscoverFeature } from './features/movies/DiscoverFeature'
import { HomeFeature } from './features/movies/HomeFeature'
import { WatchlistFeature } from './features/watchlist/WatchlistFeature'
import { ReviewFeature } from './features/reviews/ReviewFeature'
import { readStoredAuth, persistAuth } from './hooks/authStorage'
import { api } from './services/api'
import type { Movie, Review, WatchlistItem } from './types/movie'
import './index.css'

function App() {
  const location = useLocation()
  const [movies, setMovies] = useState<Movie[]>([])
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [query, setQuery] = useState('')
  const activeView = location.pathname === '/watchlist' ? 'watchlist' : 'discover'
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState('')
  const [publishingReview, setPublishingReview] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [registerMode, setRegisterMode] = useState(false)
  const [pendingSave, setPendingSave] = useState<Movie | null>(null)
  const [auth, setAuth] = useState({ username: '', email: '', password: '' })
  const [review, setReview] = useState({ rating: 5, content: '' })

  const isAuthenticated = Boolean(readStoredAuth().token)

  useEffect(() => {
    if (location.pathname === '/watchlist') {
      void loadPopular()
    }
    if (isAuthenticated) {
      void loadWatchlist()
    }
  }, [isAuthenticated, location.pathname])

  async function loadPopular() {
    setLoading(true)
    try {
      setMovies(await api.getPopularMovies())
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not load movies')
    } finally {
      setLoading(false)
    }
  }

  async function loadWatchlist() {
    try {
      const items = await api.getWatchlist()
      setWatchlist(items)
      return items
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not load your watchlist')
      return null
    }
  }

  async function handleSearch(event: FormEvent) {
    event.preventDefault()
    if (!query.trim()) {
      void loadPopular()
      return
    }

    setLoading(true)
    try {
      setMovies(await api.searchMovies(query.trim()))
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Search failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleAuth(event: FormEvent) {
    event.preventDefault()
    try {
      let token: string
      let signedInUsername: string
      if (registerMode) {
        const result = await api.register(auth.username, auth.email, auth.password)
        token = result.token
        signedInUsername = result.user.username
        setAuth((current) => ({ ...current, password: '' }))
        setRegisterMode(false)
      } else {
        const result = await api.login(auth.email, auth.password)
        token = result.token
        signedInUsername = result.user.username
      }

      persistAuth(token, signedInUsername)
      setAuthOpen(false)
      setNotice(`Welcome back, ${signedInUsername}`)
      const watchlistItems = await loadWatchlist()
      if (pendingSave) {
        setPendingSave(null)
        const mediaType = pendingSave.mediaType || 'movie'
        const alreadySaved = watchlistItems?.some((item) =>
          item.tmdbMovieId === pendingSave.id && (item.mediaType || 'movie') === mediaType)
        if (alreadySaved) {
          setNotice('Already in your watchlist')
        } else {
          await addWatchlist(pendingSave)
        }
      }
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Authentication failed')
    }
  }

  async function toggleWatchlist(movie: Movie) {
    if (!isAuthenticated) {
      setPendingSave(movie)
      setAuthOpen(true)
      return
    }

    await saveWatchlist(movie)
  }

  async function saveWatchlist(movie: Movie, watchlistItems = watchlist) {
    const mediaType = movie.mediaType || 'movie'
    const isWatchlisted = watchlistItems.some((item) => item.tmdbMovieId === movie.id && (item.mediaType || 'movie') === mediaType)
    try {
      if (isWatchlisted) {
        await api.removeFromWatchlist(movie.id, mediaType)
        setWatchlist((current) => current.filter((item) => !(item.tmdbMovieId === movie.id && (item.mediaType || 'movie') === mediaType)))
        setNotice('Removed from watchlist')
      } else {
        await addWatchlist(movie)
      }
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not update watchlist')
    }
  }

  async function addWatchlist(movie: Movie) {
    const mediaType = movie.mediaType || 'movie'
    try {
      const result = await api.addToWatchlist(movie.id, mediaType)
      setWatchlist((current) => current.some((item) =>
        item.tmdbMovieId === movie.id && (item.mediaType || 'movie') === mediaType)
        ? current
        : [...current, { ...result.data, movie }])
      setNotice('Added to watchlist')
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not update watchlist')
    }
  }

  async function openMovie(movie: Movie) {
    setSelectedMovie(movie)
    try {
      setReviews(await api.getReviews(movie.id, movie.mediaType || 'movie'))
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not load reviews')
    }
  }

  async function submitReview(event: FormEvent) {
    event.preventDefault()
    if (publishingReview) {
      return
    }
    if (!selectedMovie || !isAuthenticated) {
      setAuthOpen(true)
      return
    }
    setPublishingReview(true)
    try {
      const result = await api.createReview(selectedMovie.id, review.rating, review.content, selectedMovie.mediaType || 'movie')
      setReviews((current) => [result.data, ...current])
      setReview({ rating: 5, content: '' })
      setNotice('Review published')
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not publish review')
    } finally {
      setPublishingReview(false)
    }
  }

  const username = readStoredAuth().username || 'Sign in'

  const handleAuthFieldChange = (field: 'username' | 'email' | 'password', value: string) => {
    setAuth((current) => ({ ...current, [field]: value }))
  }

  function closeAuth() {
    setAuthOpen(false)
    setPendingSave(null)
  }

  return (
    <main className="app-shell">
      <AppNavigation
        username={username}
        onOpenAuth={() => setAuthOpen(true)}
      />

      {location.pathname === '/' ? (
        <HomeFeature
          watchlist={watchlist}
          onOpenMovie={openMovie}
          onToggleWatchlist={toggleWatchlist}
        />
      ) : location.pathname === '/discover' ? (
        <DiscoverFeature
          watchlist={watchlist}
          onOpenMovie={openMovie}
          onToggleWatchlist={toggleWatchlist}
        />
      ) : (
        <WatchlistFeature
          movies={movies}
          watchlist={watchlist}
          loading={loading}
          query={query}
          activeView={activeView}
          onSearch={handleSearch}
          onQueryChange={(value) => setQuery(value)}
          onOpenMovie={openMovie}
          onToggleWatchlist={toggleWatchlist}
        />
      )}

      {notice && <button className="notice" onClick={() => setNotice('')}>{notice} <span>×</span></button>}

      <ReviewFeature
        selectedMovie={selectedMovie}
        reviews={reviews}
        isAuthenticated={isAuthenticated}
        review={review}
        isSubmitting={publishingReview}
        onClose={() => setSelectedMovie(null)}
        onRatingChange={(value) => setReview((current) => ({ ...current, rating: value }))}
        onReviewChange={(value) => setReview((current) => ({ ...current, content: value }))}
        onSubmitReview={submitReview}
      />

      <AuthFeature
        authOpen={authOpen}
        registerMode={registerMode}
        auth={auth}
        message={pendingSave ? 'Sign in to save this title. It will be added after you sign in.' : undefined}
        onClose={closeAuth}
        onSubmit={handleAuth}
        onToggleMode={() => setRegisterMode((current) => !current)}
        onChange={handleAuthFieldChange}
      />
    </main>
  )
}

export default App