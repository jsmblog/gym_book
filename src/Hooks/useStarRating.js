// useStarRating.js
import { useState } from 'react';

export default function useStarRating(initialRating = 0) {
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);

  const onMouseEnter = (star) => setHoverRating(star);
  const onMouseLeave = () => setHoverRating(0);
  const onClick = (star) => setRating(star);

  return {
    rating,
    hoverRating,
    onMouseEnter,
    onMouseLeave,
    onClick,
    setRating,
    setHoverRating,
  };
}
