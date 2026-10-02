import type { AuthResponse, DiscoverCategory, DiscoverMoviePage, HomeMovieSections, Movie, Profile, Review, WatchlistItem } from '../types/movie'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api'

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('movie-app-token')
  const headers = new Headers(options.headers)
  headers.set('Content-Type', 'application/json')

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${apiBaseUrl}${path}`, { ...options, headers })
  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    if (response.status === 401 || (response.status === 403 && /invalid|expired token/i.test(payload?.error || ''))) {
      localStorage.removeItem('movie-app-token')
      localStorage.removeItem('movie-app-user')
    }
    throw new Error(payload?.error)
  }

  return payload as T
}

export const api = {
  getPopularMovies: () => request<Movie[]>('/movies/popular'),
  getHomeMovies: (signal?: AbortSignal) => request<HomeMovieSections>('/movies/home', { signal }),
  getDiscoverMovies: (category: DiscoverCategory, page: number, signal?: AbortSignal) =>
    request<DiscoverMoviePage>(`/movies/discover?category=${encodeURIComponent(category)}&page=${page}`, { signal }),
  searchMovies: (query: string) => request<Movie[]>(`/movies/search?query=${encodeURIComponent(query)}`),

  register: (username: string, email: string, password: string) =>
    request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    }),

  login: (email: string, password: string) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getProfile: () => request<{ user: Profile }>('/auth/profile'),
  getWatchlist: () => request<WatchlistItem[]>('/watchlist'),

  addToWatchlist: (tmdbMovieId: number, mediaType: Movie['mediaType'] = 'movie') =>
    request<{ data: WatchlistItem }>('/watchlist', {
      method: 'POST',
      body: JSON.stringify({ tmdbMovieId, mediaType }),
    }),

  removeFromWatchlist: (tmdbMovieId: number, mediaType: Movie['mediaType'] = 'movie') =>
    request<{ message: string }>(`/watchlist/${tmdbMovieId}?mediaType=${encodeURIComponent(mediaType)}`, { method: 'DELETE' }),

  getReviews: (movieId: number, mediaType: Movie['mediaType'] = 'movie') =>
    request<Review[]>(`/reviews/movie/${movieId}?mediaType=${encodeURIComponent(mediaType)}`),
  
  createReview: (tmdbMovieId: number, rating: number, content: string, mediaType: Movie['mediaType'] = 'movie') =>
    request<{ data: Review }>('/reviews', {
      method: 'POST',
      body: JSON.stringify({ tmdbMovieId, rating, content, mediaType }),
    }),
}