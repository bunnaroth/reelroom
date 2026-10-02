import type { FormEvent } from 'react'
import type { Movie, Review } from '../types/movie'

interface MovieDialogProps {
  selectedMovie: Movie
  reviews: Review[]
  isAuthenticated: boolean
  review: { rating: number; content: string }
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
  onClose,
  onRatingChange,
  onReviewChange,
  onSubmitReview,
}: MovieDialogProps) {
  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <section className="movie-dialog" onClick={(event) => event.stopPropagation()}>
        <button className="close-button" onClick={onClose} aria-label="Close movie details">×</button>
        <div className="dialog-head">
          {selectedMovie.backdropPath && <img src={selectedMovie.backdropPath} alt="" />}
          <div>
            <p className="eyebrow">{selectedMovie.releaseDate?.slice(0, 4)}</p>
            <h2>{selectedMovie.title}</h2>
            <p>{selectedMovie.overview || 'No synopsis available.'}</p>
            <div className="rating-line">
              ★ {selectedMovie.voteAverage.toFixed(1)} <span>{selectedMovie.voteCount.toLocaleString()} votes</span>
            </div>
          </div>
        </div>
        <div className="review-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">THE AUDIENCE</p>
              <h3>{reviews.length} reviews</h3>
            </div>
          </div>
          {reviews.map((item) => (
            <div className="review-item" key={item.id}>
              <strong>{item.username}</strong>
              <span>{'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}</span>
              <p>{item.content || 'Left a rating without a note.'}</p>
            </div>
          ))}
          {isAuthenticated && (
            <form className="review-form" onSubmit={onSubmitReview}>
              <label>
                Leave your rating
                <select value={review.rating} onChange={(event) => onRatingChange(Number(event.target.value))}>
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <option key={rating} value={rating}>
                      {rating} stars
                    </option>
                  ))}
                </select>
              </label>
              <textarea
                value={review.content}
                onChange={(event) => onReviewChange(event.target.value)}
                placeholder="What stayed with you?"
              />
              <button type="submit" className="primary-button">
                Publish review
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  )
}