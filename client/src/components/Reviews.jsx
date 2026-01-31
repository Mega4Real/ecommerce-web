import { useState, useEffect, useCallback } from 'react';
import { Star, MessageSquare, Send } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './Reviews.css';

const Reviews = ({ productId }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchReviews = useCallback(async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products/${productId}/reviews`);
      const data = await response.json();
      setReviews(data);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId, rating, comment })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit review');
      }

      setComment('');
      setRating(5);
      fetchReviews(); // Refresh reviews
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length).toFixed(1)
    : 0;

  if (loading) return <div className="reviews-loading">Loading reviews...</div>;

  return (
    <section className="reviews-section container">
      <div className="reviews-header">
        <h2>Customer Reviews</h2>
        {reviews.length > 0 && (
          <div className="average-rating-display">
            <div className="stars">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={20} 
                  fill={i < Math.round(averageRating) ? "gold" : "none"} 
                  stroke={i < Math.round(averageRating) ? "gold" : "#ccc"} 
                />
              ))}
            </div>
            <span>{averageRating} out of 5 ({reviews.length} reviews)</span>
          </div>
        )}
      </div>

      <div className="reviews-layout">
        <div className="reviews-list">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review.id} className="review-card">
                <div className="review-user-info">
                  <div className="user-avatar">
                    {review.user_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="user-name">{review.user_name}</p>
                    <div className="review-stars">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={14} 
                          fill={i < review.rating ? "gold" : "none"} 
                          stroke={i < review.rating ? "gold" : "#ccc"} 
                        />
                      ))}
                    </div>
                  </div>
                  <span className="review-date">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="review-comment">{review.comment}</p>
              </div>
            ))
          ) : (
            <div className="no-reviews">
              <MessageSquare size={48} opacity={0.2} />
              <p>No reviews yet. Be the first to review this product!</p>
            </div>
          )}
        </div>

        <div className="review-form-container">
          <h3>Write a Review</h3>
          {user ? (
            <form className="review-form" onSubmit={handleSubmit}>
              <div className="rating-select">
                <p>Your Rating</p>
                <div className="stars-input">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={star <= rating ? 'active' : ''}
                    >
                      <Star size={24} fill={star <= rating ? "gold" : "none"} stroke={star <= rating ? "gold" : "#ccc"} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="comment-input">
                <label htmlFor="comment">Your Review</label>
                <textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us what you think about this product..."
                  required
                ></textarea>
              </div>
              {error && <p className="review-error">{error}</p>}
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : (
                  <>Submit Review <Send size={16} style={{ marginLeft: '0.5rem' }} /></>
                )}
              </button>
            </form>
          ) : (
            <div className="login-to-review">
              <p>Please <a href="/login">login</a> to write a review.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Reviews;
