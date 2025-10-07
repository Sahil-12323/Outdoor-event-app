import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

const UserProfile = ({ onClose }) => {
  const { user, logout } = useAuth();
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('created');

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    try {
      const token = localStorage.getItem('trailmeet_token');
      const response = await fetch(`${API_BASE}/my-events`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const eventsData = await response.json();
        setMyEvents(eventsData);
      }
    } catch (error) {
      console.error('Error fetching my events:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Date TBD';
    }
  };

  const createdEvents = myEvents.filter(event => event.created_by === user?.id);
  const joinedEvents = myEvents.filter(event => 
    event.participants?.includes(user?.id) && event.created_by !== user?.id
  );

  const EventCard = ({ event }) => (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-gray-900 text-sm">{event.title}</h4>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          event.status === 'active' ? 'bg-green-100 text-green-800' :
          event.status === 'completed' ? 'bg-blue-100 text-blue-800' :
          'bg-red-100 text-red-800'
        }`}>
          {event.status}
        </span>
      </div>
      
      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
        {event.description}
      </p>
      
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>📅</span>
          <span>{formatDate(event.event_date)}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>📍</span>
          <span className="truncate">{event.location.address}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>👥</span>
          <span>{event.participants?.length || 0} participants</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="form-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="form-container slide-up max-w-2xl" data-testid="user-profile">
        <div className="form-header">
          <h2 className="text-xl font-bold text-gray-900">Profile</h2>
          <button 
            onClick={onClose}
            className="form-close-btn"
            data-testid="close-profile-btn"
          >
            ✕
          </button>
        </div>

        {/* User Info */}
        <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <img
            src={user?.picture}
            alt={user?.name}
            className="w-16 h-16 rounded-full border-4 border-white shadow-md"
          />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{user?.name}</h3>
            <p className="text-gray-600">{user?.email}</p>
            <p className="text-sm text-gray-500">
              Member since {new Date(user?.created_at).toLocaleDateString('en-US', { 
                month: 'long', 
                year: 'numeric' 
              })}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-emerald-50 rounded-lg">
            <div className="text-2xl font-bold text-emerald-600">{createdEvents.length}</div>
            <div className="text-sm text-gray-600">Events Created</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{joinedEvents.length}</div>
            <div className="text-sm text-gray-600">Events Joined</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{myEvents.length}</div>
            <div className="text-sm text-gray-600">Total Events</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-4">
          <button
            onClick={() => setActiveTab('created')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'created'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Created Events ({createdEvents.length})
          </button>
          <button
            onClick={() => setActiveTab('joined')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'joined'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Joined Events ({joinedEvents.length})
          </button>
        </div>

        {/* Events List */}
        <div className="max-h-64 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="loading-spinner w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <div className="space-y-3">
              {activeTab === 'created' ? (
                createdEvents.length > 0 ? (
                  createdEvents.map(event => (
                    <EventCard key={event.id} event={event} />
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <div className="text-4xl mb-2">🎯</div>
                    <p>You haven't created any events yet</p>
                    <p className="text-sm">Start by creating your first outdoor adventure!</p>
                  </div>
                )
              ) : (
                joinedEvents.length > 0 ? (
                  joinedEvents.map(event => (
                    <EventCard key={event.id} event={event} />
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <div className="text-4xl mb-2">🤝</div>
                    <p>You haven't joined any events yet</p>
                    <p className="text-sm">Explore the map and join exciting adventures!</p>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={logout}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            data-testid="logout-btn"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;