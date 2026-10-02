import type { FormEvent } from 'react'
import { MovieFeature } from '../movies/MovieFeature'
import type { Movie } from '../../types/movie'

interface LibraryFeatureProps {
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

export function LibraryFeature(props: LibraryFeatureProps) {
  return <MovieFeature {...props} />
}