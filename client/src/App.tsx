import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { AuthFeature } from './features/auth/AuthFeature'
import { LibraryFeature } from './features/library/LibraryFeature'
import { ReviewFeature } from './features/reviews/ReviewFeature'
import { readStoredAuth, persistAuth } from './hooks/authStorage'
import { api } from './services/api'
import type { Movie, Review } from './types/movie'
import './index.css'

function App() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [favorites, setFavorites] = useState<Movie[]>([])
  const [watchlist, setWatchlist] = useState<number[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [query, setQuery] = useState('')
  const [activeView, setActiveView] = useState<'discover' | 'saved'>('discover')
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState('')
  const [authOpen, setAuthOpen] = useState(false)
  const [registerMode, setRegisterMode] = useState(false)
  const [auth, setAuth] = useState({ username: '', email: '', password: '' })
  const [review, setReview] = useState({ rating: 5, content: '' })

  const isAuthenticated = Boolean(readStoredAuth().token)

  useEffect(() => {
    void loadPopular()
    if (isAuthenticated) {
      void loadSaved()
    }
  }, [isAuthenticated])

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

  async function loadSaved() {
    try {
      const [favoriteMovies, savedWatchlist] = await Promise.all([api.getFavorites(), api.getWatchlist()])
      setFavorites(favoriteMovies)
      setWatchlist(savedWatchlist.map((item) => item.tmdbMovieId))
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not load your library')
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
      if (registerMode) {
        await api.register(auth.username, auth.email, auth.password)
        setAuth((current) => ({ ...current, password: '' }))
        setRegisterMode(false)
        setNotice('Account created. Sign in to continue.')
        return
      }

      const result = await api.login(auth.email, auth.password)
      persistAuth(result.token, result.user.username)
      setAuthOpen(false)
      setNotice(`Welcome back, ${result.user.username}`)
      await loadSaved()
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Authentication failed')
    }
  }

  async function toggleFavorite(movie: Movie) {
    if (!isAuthenticated) {
      setAuthOpen(true)
      return
    }
    try {
      const result = await api.toggleFavorite(movie.id)
      setFavorites((current) => result.favorited ? [...current, movie] : current.filter((item) => item.id !== movie.id))
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not update favorites')
    }
  }

  async function toggleWatchlist(movie: Movie) {
    if (!isAuthenticated) {
      setAuthOpen(true)
      return
    }
    try {
      if (watchlist.includes(movie.id)) {
        await api.removeFromWatchlist(movie.id)
        setWatchlist((current) => current.filter((id) => id !== movie.id))
      } else {
        await api.addToWatchlist(movie.id)
        setWatchlist((current) => [...current, movie.id])
      }
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not update watchlist')
    }
  }

  async function openMovie(movie: Movie) {
    setSelectedMovie(movie)
    try {
      setReviews(await api.getReviews(movie.id))
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not load reviews')
    }
  }

  async function submitReview(event: FormEvent) {
    event.preventDefault()
    if (!selectedMovie || !isAuthenticated) {
      setAuthOpen(true)
      return
    }
    try {
      const result = await api.createReview(selectedMovie.id, review.rating, review.content)
      setReviews((current) => [result.data, ...current])
      setReview({ rating: 5, content: '' })
      setNotice('Review published')
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not publish review')
    }
  }

  const username = readStoredAuth().username || 'Sign in'

  const handleAuthFieldChange = (field: 'username' | 'email' | 'password', value: string) => {
    setAuth((current) => ({ ...current, [field]: value }))
  }

  return (
    <main className="app-shell">
      <LibraryFeature
        movies={movies}
        favorites={favorites}
        watchlist={watchlist}
        loading={loading}
        query={query}
        activeView={activeView}
        username={username}
        onSearch={handleSearch}
        onQueryChange={(value) => setQuery(value)}
        onOpenMovie={openMovie}
        onToggleFavorite={toggleFavorite}
        onToggleWatchlist={toggleWatchlist}
        onChangeView={setActiveView}
        onOpenAuth={() => setAuthOpen(true)}
      />

      {notice && <button className="notice" onClick={() => setNotice('')}>{notice} <span>×</span></button>}

      <ReviewFeature
        selectedMovie={selectedMovie}
        reviews={reviews}
        isAuthenticated={isAuthenticated}
        review={review}
        onClose={() => setSelectedMovie(null)}
        onRatingChange={(value) => setReview((current) => ({ ...current, rating: value }))}
        onReviewChange={(value) => setReview((current) => ({ ...current, content: value }))}
        onSubmitReview={submitReview}
      />

      <AuthFeature
        authOpen={authOpen}
        registerMode={registerMode}
        auth={auth}
        onClose={() => setAuthOpen(false)}
        onSubmit={handleAuth}
        onToggleMode={() => setRegisterMode((current) => !current)}
        onChange={handleAuthFieldChange}
      />
    </main>
  )
}

export default App
