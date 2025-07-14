import React, { Suspense } from 'react';
import LoadingSpinner from './LoadingSpinner';

const LazyWrapper = ({ children, fallback = <LoadingSpinner /> }) => {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
};

export default LazyWrapper;