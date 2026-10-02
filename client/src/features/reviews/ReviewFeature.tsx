import type { FormEvent } from 'react'
import { MovieDialog } from '../../components/MovieDialog'
import type { Movie, Review } from '../../types/movie'

interface ReviewFeatureProps {
  selectedMovie: Movie | null
  reviews: Review[]
  isAuthenticated: boolean
  review: { rating: number; content: string }
  isSubmitting: boolean
  onClose: () => void
  onRatingChange: (value: number) => void
  onReviewChange: (value: string) => void
  onSubmitReview: (event: FormEvent) => void
}

export function ReviewFeature({
  selectedMovie,
  reviews,
  isAuthenticated,
  review,
  isSubmitting,
  onClose,
  onRatingChange,
  onReviewChange,
  onSubmitReview,
}: ReviewFeatureProps) {
  if (!selectedMovie) {
    return null
  }

  return (
    <MovieDialog
      selectedMovie={selectedMovie}
      reviews={reviews}
      isAuthenticated={isAuthenticated}
      review={review}
      isSubmitting={isSubmitting}
      onClose={onClose}
      onRatingChange={onRatingChange}
      onReviewChange={onReviewChange}
      onSubmitReview={onSubmitReview}
    />
  )
}
