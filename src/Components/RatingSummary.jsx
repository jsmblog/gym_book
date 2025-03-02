import React from 'react';
import '../Styles/stylesRaitingSummary.css'
const RatingSummary = ({ ratings }) => {
  const calculateAverageRating = (ratings) => {
    if (!ratings.length) return 0;
    const total = ratings.reduce((sum, r) => sum + r, 0);
    return (total / ratings.length).toFixed(1);
  };

  const averageRating = calculateAverageRating(ratings);

  return (
    <div className="comments-summary-enhanced">
      <h3>Resumen de Evaluaciones</h3>
      <div className="summary-header">
        <p>
          <strong>{ratings.length}</strong> evaluaciones totales
        </p>
        <p className="average-rating">
          <span className="average-stars">
            {[...Array(5)].map((_, index) => (
              <span
                key={index}
                className={`star ${index < Math.round(averageRating) ? 'filled' : ''}`}
              >
                ★
              </span>
            ))}
          </span>
          <span>{averageRating} / 5</span>
        </p>
      </div>
      <div className="rating-distribution-bars">
        {[...Array(5)].reverse().map((_, index) => {
          const starValue = 5 - index;
          const starCount = ratings.filter((r) => r === starValue).length;
          const percentage = ratings.length ? ((starCount / ratings.length) * 100).toFixed(1) : 0;
          return (
            <div key={index} className="rating-bar">
              <span>{starValue} estrellas</span>
              <div className="bar-container">
                <div className="bar" style={{ width: `${percentage}%` }}></div>
              </div>
              <span>{starCount}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RatingSummary;
