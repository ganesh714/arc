import React from 'react';

export const Skeleton: React.FC<{ width?: string | number, height?: string | number, borderRadius?: string | number, className?: string }> = ({ 
  width = '100%', 
  height = '1rem', 
  borderRadius = '4px',
  className = ''
}) => {
  return (
    <div 
      className={`skeleton-pulse ${className}`}
      style={{ 
        width, 
        height, 
        borderRadius,
        backgroundColor: 'var(--border-default, #1a1d26)',
        backgroundImage: 'linear-gradient(90deg, rgba(255, 255, 255, 0) 0, rgba(255, 255, 255, 0.05) 20%, rgba(255, 255, 255, 0) 60%)',
        backgroundSize: '200% 100%',
      }}
    >
      <style>
        {`
          @keyframes shimmer {
            100% {
              background-position: -200% 0;
            }
          }
          .skeleton-pulse {
            animation: shimmer 1.5s infinite;
          }
        `}
      </style>
    </div>
  );
};
