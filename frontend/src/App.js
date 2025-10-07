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
  
  // Location states
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState(null);

  // Initialize authentication and location
  useEffect(() => {
    initAuth();
    getUserLocation();
  }, []);

  // Fetch events when user is authenticated
  useEffect(() => {
    if (user) {
      fetchEvents();
    }
  }, [user]);

  // Get user's current location
  const getUserLocation = () => {
    setLocationLoading(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser');
      setUserLocation({ lat: 19.0760, lng: 72.8777, city: 'Mumbai' }); // Default fallback
      setLocationLoading(false);
      return;
    }

    // Set timeout for location request
    const timeoutId = setTimeout(() => {
      setLocationError('Location request timed out');
      setUserLocation({ lat: 19.0760, lng: 72.8777, city: 'Mumbai' }); // Default fallback
      setLocationLoading(false);
    }, 10000); // 10 second timeout

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        clearTimeout(timeoutId);
        const { latitude, longitude } = position.coords;
        
        try {
          // Reverse geocode to get city name
          const cityName = await reverseGeocode(latitude, longitude);
          setUserLocation({ 
            lat: latitude, 
            lng: longitude, 
            city: cityName || 'Your Location',
            accuracy: position.coords.accuracy 
          });
          toast.success(`📍 Located you in ${cityName || 'your area'}!`);
        } catch (error) {
          setUserLocation({ 
            lat: latitude, 
            lng: longitude, 
            city: 'Your Location' 
          });
          toast.success('📍 Location detected successfully!');
        }
        setLocationLoading(false);
      },
      (error) => {
        clearTimeout(timeoutId);
        console.log('Geolocation error:', error);
        
        let errorMsg = 'Could not get your location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMsg = 'Location access denied by user';
            toast.error('📍 Location access denied. Using default location.');
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg = 'Location information unavailable';
            toast.warning('📍 Location unavailable. Using default location.');
            break;
          case error.TIMEOUT:
            errorMsg = 'Location request timed out';
            toast.warning('📍 Location timeout. Using default location.');
            break;
        }
        
        setLocationError(errorMsg);
        setUserLocation({ lat: 19.0760, lng: 72.8777, city: 'Mumbai' }); // Default fallback
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 300000 // 5 minutes cache
      }
    );
  };

  // Reverse geocode coordinates to city name
  const reverseGeocode = async (lat, lng) => {
    try {
      // Using a simple approach to determine city based on coordinates
      // You could integrate with a proper geocoding service here
      const indianCities = [
        { name: 'Mumbai', lat: 19.0760, lng: 72.8777, radius: 50 },
        { name: 'Delhi', lat: 28.7041, lng: 77.1025, radius: 50 },
        { name: 'Bangalore', lat: 12.9716, lng: 77.5946, radius: 40 },
        { name: 'Pune', lat: 18.5204, lng: 73.8567, radius: 30 },
        { name: 'Chennai', lat: 13.0827, lng: 80.2707, radius: 40 },
        { name: 'Kolkata', lat: 22.5726, lng: 88.3639, radius: 40 },
        { name: 'Hyderabad', lat: 17.3850, lng: 78.4867, radius: 40 },
        { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714, radius: 30 },
        { name: 'Goa', lat: 15.2993, lng: 74.1240, radius: 50 }
      ];

      // Find closest city
      let closestCity = null;
      let minDistance = Infinity;

      for (const city of indianCities) {
        const distance = Math.sqrt(
          Math.pow(lat - city.lat, 2) + Math.pow(lng - city.lng, 2)
        );
        
        if (distance < minDistance) {
          minDistance = distance;
          closestCity = city;
        }
      }

      // If within radius of a known city, return it
      if (closestCity && minDistance < (closestCity.radius / 111)) { // Rough conversion to degrees
        return closestCity.name;
      }

      return null; // Unknown location
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  };

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
      let token = localStorage.getItem('trailmeet_token');
      
      // If no token, try to get a new one
      if (!token) {
        await loginWithDemo();
        token = localStorage.getItem('trailmeet_token');
      }

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

  if (loading || locationLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50">
        <div className="text-center max-w-md mx-auto p-8">
          {/* Animated Logo */}
          <div className="relative mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg animate-pulse">
              <span className="text-3xl">🌄</span>
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-md animate-bounce">
              <span className="text-sm">🔥</span>
            </div>
          </div>

          {/* Loading Text */}
          <h2 className="text-2xl font-bold text-gray-800 mb-2">TrailMeet</h2>
          <p className="text-gray-600 font-medium mb-6">Discover & Share Outdoor Adventures</p>

          {/* Loading States */}
          <div className="space-y-4">
            {loading && (
              <div className="flex items-center justify-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
                <span className="text-gray-600">Setting up your account...</span>
              </div>
            )}
            
            {locationLoading && (
              <div className="flex items-center justify-center space-x-3">
                <div className="animate-pulse">📍</div>
                <span className="text-gray-600">Detecting your location...</span>
              </div>
            )}

            {userLocation && !locationLoading && (
              <div className="flex items-center justify-center space-x-2 text-emerald-600">
                <span>📍</span>
                <span className="font-medium">{userLocation.city}</span>
              </div>
            )}
          </div>

          {/* Permission Hint */}
          {locationLoading && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-700">
                💡 Please allow location access to find events near you
              </p>
            </div>
          )}
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
                <header className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 shadow-xl sticky top-0 z-40 backdrop-blur-sm">
                  <div className="absolute inset-0 bg-black/10"></div>
                  <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                      {/* Logo & Brand */}
                      <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-3">
                          {/* Attractive Logo */}
                          <div className="relative">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg border border-white/30">
                              <span className="text-2xl">🌄</span>
                            </div>
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-lg">
                              <span className="text-xs">🔥</span>
                            </div>
                          </div>
                          
                          {/* Brand Text */}
                          <div className="flex flex-col">
                            <h1 className="text-2xl font-bold text-white tracking-tight">
                              TrailMeet
                            </h1>
                            <p className="text-emerald-100 text-sm font-medium hidden sm:block">
                              Adventure Awaits • Connect • Explore
                            </p>
                          </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="hidden lg:flex items-center space-x-4 ml-8">
                          <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/20">
                            <span className="text-white/90 text-xs font-medium">🏃‍♀️ Live Events:</span>
                            <span className="text-white font-bold text-sm">{events.length}</span>
                          </div>
                          <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/20">
                            <span className="text-white/90 text-xs font-medium">
                              📍 {userLocation ? userLocation.city : 'Locating...'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-4">
                        {/* Enhanced Create Event Button */}
                        <button
                          onClick={() => setShowEventForm(true)}
                          className="group relative overflow-hidden bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 hover:from-yellow-300 hover:via-orange-400 hover:to-red-400 text-white px-8 py-4 rounded-3xl font-bold transition-all duration-300 flex items-center space-x-3 shadow-2xl hover:shadow-orange-500/50 transform hover:scale-110 hover:-translate-y-1 stylish-create-button"
                          data-testid="create-event-btn"
                        >
                          {/* Animated gradient overlay */}
                          <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-transparent to-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shimmer"></div>
                          
                          {/* Glowing border effect */}
                          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-yellow-400 to-red-500 blur-sm opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
                          
                          {/* Button content */}
                          <div className="relative flex items-center space-x-3">
                            <span className="text-2xl animate-bounce">🚀</span>
                            <div className="flex flex-col items-start">
                              <span className="hidden sm:inline text-lg leading-tight tracking-wide">Create Event</span>
                              <span className="sm:hidden text-lg leading-tight tracking-wide">Create</span>
                              <span className="hidden sm:inline text-xs opacity-90 font-medium">Start your adventure!</span>
                            </div>
                          </div>
                          
                          {/* Pulse effect */}
                          <div className="absolute inset-0 rounded-3xl bg-white/20 opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity duration-300"></div>
                        </button>

                        {/* User Profile */}
                        <button
                          onClick={() => setShowProfile(true)}
                          className="group flex items-center space-x-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-2xl px-4 py-2.5 transition-all duration-300 border border-white/30 shadow-lg hover:shadow-xl transform hover:scale-105"
                          data-testid="profile-btn"
                        >
                          <div className="relative">
                            <img
                              src={user.picture}
                              alt={user.name}
                              className="w-10 h-10 rounded-xl border-2 border-white/50 shadow-lg"
                            />
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
                          </div>
                          <div className="hidden sm:block text-left">
                            <p className="text-white font-semibold text-sm">{user.name}</p>
                            <p className="text-emerald-100 text-xs">Explorer</p>
                          </div>
                          <div className="text-white/70 group-hover:text-white transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Decorative Elements */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500"></div>
                  <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                  
                  {/* Floating Particles Effect */}
                  <div className="absolute top-4 left-20 w-2 h-2 bg-white/30 rounded-full animate-pulse"></div>
                  <div className="absolute top-8 right-32 w-1 h-1 bg-yellow-300/50 rounded-full animate-ping"></div>
                  <div className="absolute bottom-4 left-1/3 w-1.5 h-1.5 bg-orange-300/40 rounded-full animate-bounce"></div>
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
                          userLocation={userLocation}
                          onLocationRefresh={getUserLocation}
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