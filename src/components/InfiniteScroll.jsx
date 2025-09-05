import React, { useEffect, useRef } from "react";

const InfiniteScroll = ({ onLoadMore, hasMore, loading, children }) => {
  const observerRef = useRef();
  const loadingRef = useRef();

  useEffect(() => {
    if (loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    return () => {
      if (loadingRef.current) {
        observer.unobserve(loadingRef.current);
      }
    };
  }, [onLoadMore, hasMore, loading]);

  return (
    <div className="infinite-scroll-container">
      {children}
      {hasMore && (
        <div ref={loadingRef} className="loading-trigger">
          {loading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Loading more Pokemon...</p>
            </div>
          ) : (
            <div className="load-more-prompt">
              <p>Scroll down to load more Pokemon</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InfiniteScroll;
