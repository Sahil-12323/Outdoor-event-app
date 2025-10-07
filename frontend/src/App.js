import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import FreeMapView from './components/FreeMapView';
import AuthWrapper from './components/AuthWrapper';
import EventForm from './components/EventForm';
import ChatPanel from './components/ChatPanel';
import UserProfile from './components/UserProfile';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

// Auth Context
const AuthContext = React.createContext();

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // Initialize authentication
  useEffect(() => {
    initAuth();
  }, []);

  // Fetch events when user is authenticated
  useEffect(() => {
    if (user) {
      fetchEvents();
    }
  }, [user]);

  const initAuth = async () => {
    try {
      // Check for existing session token
      const token = localStorage.getItem('trailmeet_token');
      if (token) {
        const response = await fetch(`${API_BASE}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          return;
        } else {
          localStorage.removeItem('trailmeet_token');
        }
      }

      // Auto-login with demo user for development
      await loginWithDemo();
    } catch (error) {
      console.error('Auth initialization error:', error);
      await loginWithDemo();
    } finally {
      setLoading(false);
    }
  };

  const loginWithDemo = async () => {
    try {
      const response = await fetch(`${API_BASE}/auth/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        localStorage.setItem('trailmeet_token', userData.session_token);
        toast.success('Welcome to TrailMeet!');
      }
    } catch (error) {
      console.error('Demo login error:', error);
      toast.error('Authentication failed');
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('trailmeet_token');
      if (token) {
        await fetch(`${API_BASE}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('trailmeet_token');
      setUser(null);
      setEvents([]);
      setSelectedEvent(null);
      toast.success('Logged out successfully');
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${API_BASE}/events`);
      if (response.ok) {
        const eventsData = await response.json();
        setEvents(eventsData);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    }
  };

  const createEvent = async (eventData) => {
    try {
      const token = localStorage.getItem('trailmeet_token');
      const response = await fetch(`${API_BASE}/events`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventData)
      });

      if (response.ok) {
        const newEvent = await response.json();
        setEvents(prev => [...prev, newEvent]);
        setShowEventForm(false);
        toast.success('Event created successfully!');
        return newEvent;
      } else {
        const errorData = await response.text();
        console.error('Event creation failed:', response.status, errorData);
        if (response.status === 401) {
          toast.error('Authentication expired. Please refresh the page.');
          // Try to re-authenticate
          await loginWithDemo();
        } else {
          toast.error(`Failed to create event: ${response.status}`);
        }
        throw new Error(`Failed to create event: ${response.status}`);
      }
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event');
    }
  };

  const joinEvent = async (eventId) => {
    try {
      const token = localStorage.getItem('trailmeet_token');
      const response = await fetch(`${API_BASE}/events/${eventId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await fetchEvents(); // Refresh events
        toast.success('Successfully joined the event!');
      } else {
        const errorData = await response.json();
        toast.error(errorData.detail || 'Failed to join event');
      }
    } catch (error) {
      console.error('Error joining event:', error);
      toast.error('Failed to join event');
    }
  };

  const leaveEvent = async (eventId) => {
    try {
      const token = localStorage.getItem('trailmeet_token');
      const response = await fetch(`${API_BASE}/events/${eventId}/leave`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await fetchEvents(); // Refresh events
        toast.success('Successfully left the event');
      }
    } catch (error) {
      console.error('Error leaving event:', error);
      toast.error('Failed to leave event');
    }
  };

  const authValue = {
    user,
    logout,
    joinEvent,
    leaveEvent,
    isAuthenticated: !!user
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading TrailMeet...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={authValue}>
      <BrowserRouter>
        <div className="App">
          {!user ? (
            <AuthWrapper />
          ) : (
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                      <div className="flex items-center space-x-4">
                        <h1 className="text-2xl font-bold text-emerald-600">
                          🏔️ TrailMeet
                        </h1>
                        <span className="text-sm text-gray-500 hidden sm:block">
                          Discover & Share Outdoor Adventures
                        </span>
                      </div>

                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => setShowEventForm(true)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                          data-testid="create-event-btn"
                        >
                          <span>+</span>
                          <span className="hidden sm:inline">Create Event</span>
                        </button>

                        <button
                          onClick={() => setShowProfile(true)}
                          className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors"
                          data-testid="profile-btn"
                        >
                          <img
                            src={user.picture}
                            alt={user.name}
                            className="w-8 h-8 rounded-full border-2 border-gray-200"
                          />
                          <span className="hidden sm:inline font-medium">{user.name}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </header>

                {/* Main Content */}
                <main className="relative">
                  <Routes>
                    <Route
                      path="/"
                      element={
                        <FreeMapView
                          events={events}
                          selectedEvent={selectedEvent}
                          onEventSelect={setSelectedEvent}
                          onEventDeselect={() => setSelectedEvent(null)}
                          onShowChat={(event) => {
                            setSelectedEvent(event);
                            setShowChat(true);
                          }}
                        />
                      }
                    />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>

                  {/* Event Form Modal */}
                  {showEventForm && (
                    <EventForm
                      onClose={() => setShowEventForm(false)}
                      onSubmit={createEvent}
                    />
                  )}

                  {/* Chat Panel */}
                  {showChat && selectedEvent && (
                    <ChatPanel
                      event={selectedEvent}
                      onClose={() => setShowChat(false)}
                    />
                  )}

                  {/* User Profile Modal */}
                  {showProfile && (
                    <UserProfile
                      onClose={() => setShowProfile(false)}
                    />
                  )}
                </main>
              </div>
          )}
          <Toaster position="top-right" />
        </div>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

export default App;