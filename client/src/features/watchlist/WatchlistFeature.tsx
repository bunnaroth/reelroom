import type { FormEvent } from 'react'
import { MovieFeature } from '../movies/MovieFeature'
import type { Movie, WatchlistItem } from '../../types/movie'

interface WatchlistFeatureProps {
  movies: Movie[]
  watchlist: WatchlistItem[]
  loading: boolean
  query: string
  activeView: 'discover' | 'watchlist'
  onSearch: (event: FormEvent) => void
  onQueryChange: (value: string) => void
  onOpenMovie: (movie: Movie) => void
  onToggleWatchlist: (movie: Movie) => void
}

export function WatchlistFeature(props: WatchlistFeatureProps) {
  return <MovieFeature {...props} />
}