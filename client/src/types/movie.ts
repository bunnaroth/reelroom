export interface Movie {
  id: number
  mediaType?: 'movie' | 'tv'
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

export type DiscoverCategory = 'all' | 'hollywood' | 'animation' | 'c-drama' | 'k-drama'

export interface HomeMovieSections {
  popular: Movie[]
  animation: Movie[]
  hollywood: Movie[]
  kDrama: Movie[]
  cDrama: Movie[]
}

export interface DiscoverMoviePage {
  movies: Movie[]
  page: number
  totalPages: number
}

export interface Review {
  id: number
  userId: number
  username: string
  mediaType?: 'movie' | 'tv'
  rating: number
  content: string
  createdAt: string
}

export interface WatchlistItem {
  id: number
  userId: number
  tmdbMovieId: number
  mediaType?: 'movie' | 'tv'
  createdAt: string
  movie?: Movie
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