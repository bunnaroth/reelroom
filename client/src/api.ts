export interface Movie {
  id: number
  title: string
  overview: string | null
  posterPath: string | null
  backdropPath: string | null
  releaseDate: string
  voteAverage: number
  voteCount: number
  popularity: number
  genreIds: number[]
}

export interface Review {
  id: number
  userId: number
  username: string
  rating: number
  content: string
  createdAt: string
}

export interface WatchlistItem {
  id: number
  userId: number
  tmdbMovieId: number
  createdAt: string
}

export interface AuthResponse {
  user: {
    id: number
    username: string
    email: string
    role: string
  }
  token: string
}

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
    throw new Error(payload?.error || 'The request could not be completed')
  }

  return payload as T
}

export const api = {
  getPopularMovies: () => request<Movie[]>('/movies/popular'),
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
  getFavorites: () => request<Movie[]>('/favorites'),
  toggleFavorite: (tmdbMovieId: number) =>
    request<{ favorited: boolean }>('/favorites/toggle', {
      method: 'POST',
      body: JSON.stringify({ tmdbMovieId }),
    }),
  getWatchlist: () => request<WatchlistItem[]>('/watchlist'),
  addToWatchlist: (tmdbMovieId: number) =>
    request<{ data: WatchlistItem }>('/watchlist', {
      method: 'POST',
      body: JSON.stringify({ tmdbMovieId }),
    }),
  removeFromWatchlist: (tmdbMovieId: number) =>
    request<{ message: string }>(`/watchlist/${tmdbMovieId}`, { method: 'DELETE' }),
  getReviews: (movieId: number) => request<Review[]>(`/reviews/movie/${movieId}`),
  createReview: (tmdbMovieId: number, rating: number, content: string) =>
    request<{ data: Review }>('/reviews', {
      method: 'POST',
      body: JSON.stringify({ tmdbMovieId, rating, content }),
    }),
}