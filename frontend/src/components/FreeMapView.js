import React, { useState, useCallback, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '../App';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const EVENT_TYPE_CONFIG = {
  hiking: { color: '#059669', icon: '⛰️', label: 'Hiking', gradient: 'from-emerald-400 to-emerald-600' },
  camping: { color: '#0d9488', icon: '🏕️', label: 'Camping', gradient: 'from-teal-400 to-teal-600' },
  cycling: { color: '#0891b2', icon: '🚵', label: 'Cycling', gradient: 'from-cyan-400 to-cyan-600' },
  sports: { color: '#2563eb', icon: '🏐', label: 'Sports', gradient: 'from-blue-400 to-blue-600' },
  workshop: { color: '#7c3aed', icon: '🎯', label: 'Workshop', gradient: 'from-violet-400 to-violet-600' },
  festival: { color: '#dc2626', icon: '🎭', label: 'Festival', gradient: 'from-red-400 to-red-600' },
  climbing: { color: '#ea580c', icon: '🧗‍♀️', label: 'Climbing', gradient: 'from-orange-400 to-orange-600' },
  kayaking: { color: '#0284c7', icon: '🏄', label: 'Kayaking', gradient: 'from-sky-400 to-sky-600' },
  running: { color: '#16a34a', icon: '🏃‍♀️', label: 'Running', gradient: 'from-green-400 to-green-600' }
};

// Create custom colored markers for different event types
const createCustomIcon = (eventType) => {
  const config = getEventTypeConfig(eventType);
  
  return L.divIcon({
    html: `
      <div style="
        background-color: ${config.color};
        width: 30px;
        height: 30px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <span style="transform: rotate(45deg); font-size: 14px;">${config.icon}</span>
      </div>
    `,
    className: 'custom-div-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
  });
};

const EventMarker = ({ event, onJoin, onLeave, onShowChat, currentUserId }) => {
  const config = getEventTypeConfig(event.event_type);
  const isParticipant = event.participants?.includes(currentUserId);
  const isCreator = event.created_by === currentUserId;

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
    } catch {
      return 'Date TBD';
    }
  };

  return (
    <Marker 
      position={[event.location.lat, event.location.lng]} 
      icon={createCustomIcon(event.event_type)}
    >
      <Popup maxWidth={350} className="custom-popup">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-gray-900 pr-4">{event.title}</h3>
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
              {config.label}
            </span>
          </div>

          <div className="space-y-3">
            <p className="text-gray-600 text-sm leading-relaxed">
              {event.description}
            </p>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm">📍</span>
                <div>
                  <div className="font-medium text-gray-900 text-sm">Location</div>
                  <div className="text-xs text-gray-600">{event.location.address}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm">📅</span>
                <div>
                  <div className="font-medium text-gray-900 text-sm">Date & Time</div>
                  <div className="text-xs text-gray-600">{formatDate(event.event_date)}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm">👥</span>
                <div>
                  <div className="font-medium text-gray-900 text-sm">Participants</div>
                  <div className="text-xs text-gray-600">
                    {event.participants?.length || 0}
                    {event.capacity && ` / ${event.capacity}`} joined
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {!isCreator && (
                <>
                  {!isParticipant ? (
                    <button
                      onClick={() => onJoin(event.id)}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded font-medium transition-colors"
                      data-testid="join-event-btn"
                    >
                      ✓ Join
                    </button>
                  ) : (
                    <button
                      onClick={() => onLeave(event.id)}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded font-medium transition-colors"
                      data-testid="leave-event-btn"
                    >
                      ✗ Leave
                    </button>
                  )}
                </>
              )}

              {(isParticipant || isCreator) && (
                <button
                  onClick={() => onShowChat(event)}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded font-medium transition-colors"
                  data-testid="chat-btn"
                >
                  💬 Chat
                </button>
              )}

              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${event.location.lat},${event.location.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded font-medium transition-colors"
                data-testid="directions-btn"
              >
                🧭 Directions
              </a>
            </div>
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

// Helper function to get icon and color for any event type
const getEventTypeConfig = (eventType) => {
  const type = eventType.toLowerCase();
  
  // Predefined popular types
  const typeMapping = {
    hiking: { icon: '⛰️', color: '#059669', gradient: 'from-emerald-400 to-emerald-600' },
    camping: { icon: '🏕️', color: '#0d9488', gradient: 'from-teal-400 to-teal-600' },
    cycling: { icon: '🚵', color: '#0891b2', gradient: 'from-cyan-400 to-cyan-600' },
    sports: { icon: '🏐', color: '#2563eb', gradient: 'from-blue-400 to-blue-600' },
    workshop: { icon: '🎯', color: '#7c3aed', gradient: 'from-violet-400 to-violet-600' },
    festival: { icon: '🎭', color: '#dc2626', gradient: 'from-red-400 to-red-600' },
    climbing: { icon: '🧗‍♀️', color: '#ea580c', gradient: 'from-orange-400 to-orange-600' },
    kayaking: { icon: '🏄', color: '#0284c7', gradient: 'from-sky-400 to-sky-600' },
    running: { icon: '🏃‍♀️', color: '#16a34a', gradient: 'from-green-400 to-green-600' },
    
    // Dynamic types - auto-generate based on keywords
    movie: { icon: '🎬', color: '#7c2d12', gradient: 'from-amber-400 to-orange-600' },
    cinema: { icon: '🍿', color: '#7c2d12', gradient: 'from-amber-400 to-orange-600' },
    concert: { icon: '🎵', color: '#be185d', gradient: 'from-pink-400 to-rose-600' },
    music: { icon: '🎶', color: '#be185d', gradient: 'from-pink-400 to-rose-600' },
    food: { icon: '🍕', color: '#dc2626', gradient: 'from-red-400 to-red-600' },
    photography: { icon: '📸', color: '#1e40af', gradient: 'from-blue-400 to-indigo-600' },
    art: { icon: '🎨', color: '#7c3aed', gradient: 'from-purple-400 to-violet-600' },
    dance: { icon: '💃', color: '#be185d', gradient: 'from-pink-400 to-fuchsia-600' },
    yoga: { icon: '🧘‍♀️', color: '#059669', gradient: 'from-emerald-400 to-teal-600' },
    meditation: { icon: '🕯️', color: '#6b21a8', gradient: 'from-violet-400 to-purple-600' },
    gaming: { icon: '🎮', color: '#1e40af', gradient: 'from-blue-400 to-purple-600' },
    tech: { icon: '💻', color: '#374151', gradient: 'from-gray-400 to-slate-600' },
    book: { icon: '📚', color: '#92400e', gradient: 'from-amber-400 to-yellow-600' },
    study: { icon: '📖', color: '#92400e', gradient: 'from-amber-400 to-yellow-600' },
    party: { icon: '🎉', color: '#dc2626', gradient: 'from-red-400 to-pink-600' },
    networking: { icon: '🤝', color: '#059669', gradient: 'from-emerald-400 to-green-600' },
    business: { icon: '💼', color: '#374151', gradient: 'from-gray-400 to-blue-600' }
  };
  
  // Try exact match first
  if (typeMapping[type]) {
    return { ...typeMapping[type], label: eventType };
  }
  
  // Try partial matches
  for (const [key, config] of Object.entries(typeMapping)) {
    if (type.includes(key) || key.includes(type)) {
      return { ...config, label: eventType };
    }
  }
  
  // Default for unknown types
  return { 
    icon: '🎯', 
    color: '#6b7280', 
    gradient: 'from-gray-400 to-gray-600',
    label: eventType 
  };
};

const MapControls = ({ onFilterChange, selectedFilter, eventCounts, availableTypes }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="absolute top-4 left-4 z-1000">
      {/* Filter Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 px-4 py-3 flex items-center space-x-2 hover:bg-white transition-all duration-200"
      >
        <span className="text-lg">🎯</span>
        <span className="font-medium text-gray-700">
          {selectedFilter === 'all' ? 'All Events' : getEventTypeConfig(selectedFilter).label}
        </span>
        <span className="text-xs bg-emerald-500 text-white px-2 py-1 rounded-full">
          {selectedFilter === 'all' ? eventCounts.all : (eventCounts[selectedFilter] || 0)}
        </span>
        <svg className={`w-4 h-4 text-gray-500 transition-transform ${showDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div className="mt-2 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-200 p-2 min-w-[200px] max-h-80 overflow-y-auto">
          {/* All Events */}
          <button
            onClick={() => {
              onFilterChange('all');
              setShowDropdown(false);
            }}
            className={`w-full px-3 py-2 rounded-lg text-left transition-all duration-200 flex items-center justify-between ${
              selectedFilter === 'all' 
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white' 
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <div className="flex items-center space-x-2">
              <span>🌟</span>
              <span className="font-medium">All Events</span>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${
              selectedFilter === 'all' 
                ? 'bg-white/20 text-white' 
                : 'bg-gray-200 text-gray-600'
            }`}>
              {eventCounts.all}
            </span>
          </button>

          {/* Dynamic Event Types */}
          {availableTypes.map((type) => {
            const config = getEventTypeConfig(type);
            const count = eventCounts[type] || 0;
            const isSelected = selectedFilter === type;
            
            return (
              <button
                key={type}
                onClick={() => {
                  onFilterChange(type);
                  setShowDropdown(false);
                }}
                className={`w-full px-3 py-2 rounded-lg text-left transition-all duration-200 flex items-center justify-between mt-1 ${
                  isSelected 
                    ? `bg-gradient-to-r ${config.gradient} text-white` 
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span>{config.icon}</span>
                  <span className="font-medium capitalize">{config.label}</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  isSelected 
                    ? 'bg-white/20 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

const FreeMapView = ({ events, selectedEvent, onEventSelect, onEventDeselect, onShowChat }) => {
  const { user, joinEvent, leaveEvent } = useAuth();
  const [mapCenter, setMapCenter] = useState([19.0760, 72.8777]); // Mumbai default
  const [filter, setFilter] = useState('all');

  // Get all unique event types dynamically from actual events
  const availableTypes = [...new Set(events.map(event => event.event_type))].sort();
  
  // Calculate event counts for each type (dynamic)
  const eventCounts = {
    all: events.length,
    ...availableTypes.reduce((acc, type) => {
      acc[type] = events.filter(event => event.event_type === type).length;
      return acc;
    }, {})
  };

  // Get user's location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapCenter([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.log('Geolocation error:', error);
          // Keep default Mumbai location
        }
      );
    }
  }, []);

  // Filter events based on selected filter
  const filteredEvents = events.filter(event => 
    filter === 'all' || event.event_type === filter
  );

  return (
    <div style={{ height: 'calc(100vh - 4rem)', width: '100%', position: 'relative' }} data-testid="map-container">
      <MapContainer
        center={mapCenter}
        zoom={10}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
        data-testid="leaflet-map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {filteredEvents.map((event) => (
          <EventMarker
            key={event.id}
            event={event}
            onJoin={joinEvent}
            onLeave={leaveEvent}
            onShowChat={onShowChat}
            currentUserId={user?.id}
          />
        ))}
      </MapContainer>

      <MapControls 
        onFilterChange={setFilter} 
        selectedFilter={filter}
        eventCounts={eventCounts}
        availableTypes={availableTypes}
      />

      {/* Compact Event Summary */}
      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-3 z-1000">
        <div className="text-center min-w-[80px]">
          <div className="text-xl font-bold text-gray-900">
            {filteredEvents.length}
          </div>
          <div className="text-xs text-gray-600">
            {filteredEvents.length === 1 ? 'Event' : 'Events'}
          </div>
          {filter !== 'all' && (
            <div className="mt-1 flex items-center justify-center space-x-1">
              <span className="text-sm">{EVENT_TYPE_CONFIG[filter]?.icon}</span>
            </div>
          )}
        </div>
      </div>

      {/* Compact Location Info */}
      <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 px-3 py-2 z-1000">
        <div className="text-xs text-gray-500 text-center">
          📍 Mumbai
        </div>
      </div>
    </div>
  );
};

export default FreeMapView;