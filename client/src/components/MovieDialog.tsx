import type { FormEvent } from 'react'
import type { Movie, Review } from '../types/movie'

interface MovieDialogProps {
  selectedMovie: Movie
  reviews: Review[]
  isAuthenticated: boolean
  review: { rating: number; content: string }
  isSubmitting: boolean
  onClose: () => void
  onRatingChange: (value: number) => void
  onReviewChange: (value: string) => void
  onSubmitReview: (event: FormEvent) => void
}

export function MovieDialog({
  selectedMovie,
  reviews,
  isAuthenticated,
  review,
  isSubmitting,
  onClose,
  onRatingChange,
  onReviewChange,
  onSubmitReview,
}: MovieDialogProps) {
  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <section className="movie-dialog" onClick={(event) => event.stopPropagation()}>
        <button className="close-button" onClick={onClose} aria-label="Close title details">×</button>
        <div className="dialog-head">
          {selectedMovie.backdropPath
            ? <img src={selectedMovie.backdropPath} alt="" />
            : <div className="dialog-backdrop-placeholder" aria-hidden="true" />}
          <div>
            <p className="eyebrow">{selectedMovie.mediaType === 'tv' ? 'TV SERIES' : 'FILM'} · {selectedMovie.releaseDate?.slice(0, 4)}</p>
            <h2>{selectedMovie.title}</h2>
            <p>{selectedMovie.overview || 'No synopsis available.'}</p>
            <div className="rating-line">
              ★ {selectedMovie.voteAverage.toFixed(1)} <span>{selectedMovie.voteCount.toLocaleString()} votes</span>
            </div>
          </div>
        </div>
        <div className="review-section">
              <p className="eyebrow">THE AUDIENCE</p>
          {reviews.map((item) => (
            <div className="review-item" key={item.id}>
              <strong>{item.username}</strong>
              <span>{'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}</span>
              <p>{item.content || 'Left a rating without a note.'}</p>
            </div>
          ))}
          {isAuthenticated && (
            <form className="review-form" onSubmit={onSubmitReview}>
              <fieldset className="review-rating">
                <legend>Choose your rating</legend>
                <div className="rating-stars" role="group" aria-label="Your rating">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      aria-pressed={review.rating === rating}
                      aria-label={`${rating} ${rating === 1 ? 'star' : 'stars'}`}
                      className={rating <= review.rating ? 'rating-star selected' : 'rating-star'}
                      onClick={() => onRatingChange(rating)}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </fieldset>
              <textarea
                value={review.content}
                onChange={(event) => onReviewChange(event.target.value)}
                placeholder="What stayed with you?"
              />
              <button type="submit" className="primary-button" disabled={isSubmitting}>
                {isSubmitting ? 'Publishing...' : 'Publish review'}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  )
}