import React from 'react';

const AuthWrapper = () => {
  return (
    <div className="auth-wrapper">
      <div className="auth-card fade-in">
        <div className="auth-logo">🏔️</div>
        
        <h1 className="auth-title">Welcome to TrailMeet</h1>
        <p className="auth-subtitle">
          Discover amazing outdoor adventures and connect with fellow explorers in your area.
        </p>

        <div className="auth-btn">
          <span>🌟</span>
          <span>Getting Started...</span>
        </div>

        <div className="auth-features">
          <div className="auth-feature">
            <span className="text-emerald-600">🗺️</span>
            <span>Explore events on an interactive map</span>
          </div>
          <div className="auth-feature">
            <span className="text-emerald-600">➕</span>
            <span>Create and share your own adventures</span>
          </div>
          <div className="auth-feature">
            <span className="text-emerald-600">💬</span>
            <span>Chat with other participants</span>
          </div>
          <div className="auth-feature">
            <span className="text-emerald-600">🤝</span>
            <span>Build a community of outdoor enthusiasts</span>
          </div>
        </div>

        <div className="mt-6 text-xs text-gray-500 text-center">
          Demo mode - automatically signed in as demo user
        </div>
      </div>
    </div>
  );
};

export default AuthWrapper;