import React from 'react';

export const Loader: React.FC<{ size?: 'sm' | 'md' | 'lg', text?: string }> = ({ size = 'md', text }) => {
  const sizeMap = {
    sm: '1rem',
    md: '2rem',
    lg: '3rem'
  };

  const spinnerStyle = {
    width: sizeMap[size],
    height: sizeMap[size],
    border: '3px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '50%',
    borderTopColor: '#0c8ce9',
    animation: 'spin 1s ease-in-out infinite',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%', padding: '2rem' }}>
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
      <div style={spinnerStyle} />
      {text && <p style={{ marginTop: '1rem', color: 'var(--text-secondary, #888)', fontSize: '0.875rem' }}>{text}</p>}
    </div>
  );
};
