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

export interface Profile {
  id: number
  username: string
  email: string
  role: string
  createdAt: string
  updatedAt: string
}