import React, { useState, useEffect, useRef } from 'react';
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

// Dynamic event type configuration - no more hardcoded types!

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

const EventMarker = ({ event, onJoin, onLeave, onShowChat, currentUserId, isHovered, onHover, onLeaveHover }) => {
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
    <>
      <Marker 
        position={[event.location.lat, event.location.lng]} 
        icon={createCustomIcon(event.event_type)}
        eventHandlers={{
          mouseover: () => onHover(event.id),
          mouseout: () => onLeaveHover()
        }}
      />
      
      {/* Hover Popup - Always on top */}
      {isHovered && (
        <div 
          className="event-hover-popup bg-white rounded-xl shadow-2xl border border-gray-200 p-4 max-w-sm w-80"
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 99999
          }}
          onMouseEnter={() => onHover(event.id)}
          onMouseLeave={onLeaveHover}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 pr-2">
              <h3 className="text-lg font-bold text-gray-900 leading-tight">{event.title}</h3>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 mt-2">
                {config.icon} {config.label}
              </span>
            </div>
            <button
              onClick={onLeaveHover}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Description */}
          <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
            {event.description}
          </p>

          {/* Details Grid */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-3">
              <span className="text-base">📍</span>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 text-sm">Location</div>
                <div className="text-xs text-gray-600 truncate">{event.location.address}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-base">📅</span>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 text-sm">Date & Time</div>
                <div className="text-xs text-gray-600">{formatDate(event.event_date)}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-base">👥</span>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 text-sm">Participants</div>
                <div className="text-xs text-gray-600">
                  {event.participants?.length || 0}
                  {event.capacity && ` / ${event.capacity}`} joined
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
            {!isCreator && (
              <>
                {!isParticipant ? (
                  <button
                    onClick={() => {
                      onJoin(event.id);
                      onLeaveHover();
                    }}
                    className="flex-1 px-3 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-sm rounded-lg font-medium transition-all transform hover:scale-105 shadow-md"
                    data-testid="join-event-btn"
                  >
                    ✓ Join Event
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      onLeave(event.id);
                      onLeaveHover();
                    }}
                    className="flex-1 px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-sm rounded-lg font-medium transition-all transform hover:scale-105 shadow-md"
                    data-testid="leave-event-btn"
                  >
                    ✗ Leave Event
                  </button>
                )}
              </>
            )}

            {(isParticipant || isCreator) && (
              <button
                onClick={() => {
                  onShowChat(event);
                  onLeaveHover();
                }}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm rounded-lg font-medium transition-all transform hover:scale-105 shadow-md"
                data-testid="chat-btn"
              >
                💬 Chat
              </button>
            )}

            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${event.location.lat},${event.location.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 text-sm rounded-lg font-medium transition-all transform hover:scale-105 shadow-md"
              data-testid="directions-btn"
            >
              🧭 Directions
            </a>
          </div>
        </div>
      )}
    </>
  );
};

// Helper function to get icon and color for any event type
const getEventTypeConfig = (eventType) => {
  const type = eventType.toLowerCase().trim();
  
  // Comprehensive type mapping with smart keyword matching
  const typeMapping = {
    // Outdoor & Adventure
    hiking: { icon: '⛰️', color: '#059669', gradient: 'from-emerald-400 to-emerald-600' },
    trekking: { icon: '🥾', color: '#059669', gradient: 'from-emerald-400 to-emerald-600' },
    camping: { icon: '🏕️', color: '#0d9488', gradient: 'from-teal-400 to-teal-600' },
    cycling: { icon: '🚵', color: '#0891b2', gradient: 'from-cyan-400 to-cyan-600' },
    biking: { icon: '🚴‍♂️', color: '#0891b2', gradient: 'from-cyan-400 to-cyan-600' },
    climbing: { icon: '🧗‍♀️', color: '#ea580c', gradient: 'from-orange-400 to-orange-600' },
    kayaking: { icon: '🛶', color: '#0284c7', gradient: 'from-sky-400 to-sky-600' },
    canoeing: { icon: '🚣‍♀️', color: '#0284c7', gradient: 'from-sky-400 to-sky-600' },
    running: { icon: '🏃‍♀️', color: '#16a34a', gradient: 'from-green-400 to-green-600' },
    marathon: { icon: '🏃‍♂️', color: '#16a34a', gradient: 'from-green-400 to-green-600' },
    
    // Beach & Water
    beach: { icon: '🏖️', color: '#0ea5e9', gradient: 'from-sky-400 to-blue-600' },
    swimming: { icon: '🏊‍♀️', color: '#0ea5e9', gradient: 'from-sky-400 to-blue-600' },
    surfing: { icon: '🏄‍♂️', color: '#0ea5e9', gradient: 'from-sky-400 to-blue-600' },
    diving: { icon: '🤿', color: '#0369a1', gradient: 'from-blue-500 to-blue-700' },
    snorkeling: { icon: '🐠', color: '#0369a1', gradient: 'from-blue-500 to-blue-700' },
    
    // Sports & Fitness
    sports: { icon: '⚽', color: '#2563eb', gradient: 'from-blue-400 to-blue-600' },
    football: { icon: '⚽', color: '#2563eb', gradient: 'from-blue-400 to-blue-600' },
    soccer: { icon: '⚽', color: '#2563eb', gradient: 'from-blue-400 to-blue-600' },
    basketball: { icon: '🏀', color: '#ea580c', gradient: 'from-orange-400 to-orange-600' },
    tennis: { icon: '🎾', color: '#16a34a', gradient: 'from-green-400 to-green-600' },
    cricket: { icon: '🏏', color: '#dc2626', gradient: 'from-red-400 to-red-600' },
    volleyball: { icon: '🏐', color: '#2563eb', gradient: 'from-blue-400 to-blue-600' },
    badminton: { icon: '🏸', color: '#7c3aed', gradient: 'from-violet-400 to-violet-600' },
    golf: { icon: '⛳', color: '#16a34a', gradient: 'from-green-400 to-green-600' },
    gym: { icon: '💪', color: '#dc2626', gradient: 'from-red-400 to-red-600' },
    fitness: { icon: '🏋️‍♀️', color: '#dc2626', gradient: 'from-red-400 to-red-600' },
    workout: { icon: '💪', color: '#dc2626', gradient: 'from-red-400 to-red-600' },
    yoga: { icon: '🧘‍♀️', color: '#059669', gradient: 'from-emerald-400 to-teal-600' },
    pilates: { icon: '🤸‍♀️', color: '#7c3aed', gradient: 'from-violet-400 to-violet-600' },
    
    // Entertainment & Arts
    movie: { icon: '🎬', color: '#7c2d12', gradient: 'from-amber-400 to-orange-600' },
    cinema: { icon: '🍿', color: '#7c2d12', gradient: 'from-amber-400 to-orange-600' },
    film: { icon: '🎥', color: '#7c2d12', gradient: 'from-amber-400 to-orange-600' },
    concert: { icon: '🎵', color: '#be185d', gradient: 'from-pink-400 to-rose-600' },
    music: { icon: '🎶', color: '#be185d', gradient: 'from-pink-400 to-rose-600' },
    band: { icon: '🎤', color: '#be185d', gradient: 'from-pink-400 to-rose-600' },
    karaoke: { icon: '🎤', color: '#be185d', gradient: 'from-pink-400 to-rose-600' },
    dance: { icon: '💃', color: '#be185d', gradient: 'from-pink-400 to-fuchsia-600' },
    dancing: { icon: '🕺', color: '#be185d', gradient: 'from-pink-400 to-fuchsia-600' },
    theater: { icon: '🎭', color: '#7c3aed', gradient: 'from-purple-400 to-violet-600' },
    theatre: { icon: '🎭', color: '#7c3aed', gradient: 'from-purple-400 to-violet-600' },
    drama: { icon: '🎭', color: '#7c3aed', gradient: 'from-purple-400 to-violet-600' },
    comedy: { icon: '😂', color: '#eab308', gradient: 'from-yellow-400 to-yellow-600' },
    standup: { icon: '🎤', color: '#eab308', gradient: 'from-yellow-400 to-yellow-600' },
    
    // Food & Social
    food: { icon: '🍕', color: '#dc2626', gradient: 'from-red-400 to-red-600' },
    restaurant: { icon: '🍽️', color: '#dc2626', gradient: 'from-red-400 to-red-600' },
    dining: { icon: '🍽️', color: '#dc2626', gradient: 'from-red-400 to-red-600' },
    cooking: { icon: '👨‍🍳', color: '#ea580c', gradient: 'from-orange-400 to-orange-600' },
    bbq: { icon: '🔥', color: '#dc2626', gradient: 'from-red-400 to-red-600' },
    barbecue: { icon: '🔥', color: '#dc2626', gradient: 'from-red-400 to-red-600' },
    picnic: { icon: '🧺', color: '#16a34a', gradient: 'from-green-400 to-green-600' },
    coffee: { icon: '☕', color: '#92400e', gradient: 'from-amber-600 to-yellow-600' },
    tea: { icon: '🫖', color: '#059669', gradient: 'from-emerald-400 to-teal-600' },
    drinks: { icon: '🍹', color: '#be185d', gradient: 'from-pink-400 to-rose-600' },
    party: { icon: '🎉', color: '#dc2626', gradient: 'from-red-400 to-pink-600' },
    celebration: { icon: '🎊', color: '#dc2626', gradient: 'from-red-400 to-pink-600' },
    
    // Learning & Professional
    workshop: { icon: '🛠️', color: '#7c3aed', gradient: 'from-violet-400 to-violet-600' },
    seminar: { icon: '📋', color: '#374151', gradient: 'from-gray-400 to-slate-600' },
    conference: { icon: '🎯', color: '#374151', gradient: 'from-gray-400 to-slate-600' },
    meetup: { icon: '🤝', color: '#059669', gradient: 'from-emerald-400 to-green-600' },
    networking: { icon: '🤝', color: '#059669', gradient: 'from-emerald-400 to-green-600' },
    business: { icon: '💼', color: '#374151', gradient: 'from-gray-400 to-blue-600' },
    training: { icon: '📚', color: '#2563eb', gradient: 'from-blue-400 to-blue-600' },
    course: { icon: '📖', color: '#2563eb', gradient: 'from-blue-400 to-blue-600' },
    class: { icon: '🎓', color: '#7c3aed', gradient: 'from-violet-400 to-violet-600' },
    study: { icon: '📚', color: '#92400e', gradient: 'from-amber-400 to-yellow-600' },
    book: { icon: '📖', color: '#92400e', gradient: 'from-amber-400 to-yellow-600' },
    reading: { icon: '📚', color: '#92400e', gradient: 'from-amber-400 to-yellow-600' },
    
    // Creative & Hobbies
    art: { icon: '🎨', color: '#7c3aed', gradient: 'from-purple-400 to-violet-600' },
    painting: { icon: '🖌️', color: '#7c3aed', gradient: 'from-purple-400 to-violet-600' },
    drawing: { icon: '✏️', color: '#374151', gradient: 'from-gray-400 to-slate-600' },
    photography: { icon: '📸', color: '#1e40af', gradient: 'from-blue-400 to-indigo-600' },
    photo: { icon: '📷', color: '#1e40af', gradient: 'from-blue-400 to-indigo-600' },
    craft: { icon: '✂️', color: '#be185d', gradient: 'from-pink-400 to-rose-600' },
    pottery: { icon: '🏺', color: '#92400e', gradient: 'from-amber-600 to-orange-600' },
    
    // Technology & Gaming
    gaming: { icon: '🎮', color: '#1e40af', gradient: 'from-blue-400 to-purple-600' },
    game: { icon: '🎲', color: '#1e40af', gradient: 'from-blue-400 to-purple-600' },
    esports: { icon: '🎮', color: '#7c3aed', gradient: 'from-violet-400 to-purple-600' },
    tech: { icon: '💻', color: '#374151', gradient: 'from-gray-400 to-slate-600' },
    coding: { icon: '💻', color: '#059669', gradient: 'from-emerald-400 to-teal-600' },
    programming: { icon: '⌨️', color: '#059669', gradient: 'from-emerald-400 to-teal-600' },
    hackathon: { icon: '💻', color: '#dc2626', gradient: 'from-red-400 to-red-600' },
    
    // Health & Wellness
    meditation: { icon: '🧘', color: '#6b21a8', gradient: 'from-violet-400 to-purple-600' },
    mindfulness: { icon: '🕯️', color: '#6b21a8', gradient: 'from-violet-400 to-purple-600' },
    spa: { icon: '💆‍♀️', color: '#be185d', gradient: 'from-pink-400 to-rose-600' },
    massage: { icon: '💆‍♂️', color: '#be185d', gradient: 'from-pink-400 to-rose-600' },
    wellness: { icon: '🌿', color: '#059669', gradient: 'from-emerald-400 to-teal-600' },
    
    // Festivals & Events
    festival: { icon: '🎪', color: '#dc2626', gradient: 'from-red-400 to-red-600' },
    carnival: { icon: '🎠', color: '#eab308', gradient: 'from-yellow-400 to-orange-600' },
    fair: { icon: '🎡', color: '#be185d', gradient: 'from-pink-400 to-rose-600' },
    market: { icon: '🛒', color: '#059669', gradient: 'from-emerald-400 to-green-600' },
    
    // Nature & Wildlife
    nature: { icon: '🌲', color: '#059669', gradient: 'from-emerald-400 to-green-600' },
    wildlife: { icon: '🦋', color: '#16a34a', gradient: 'from-green-400 to-green-600' },
    birdwatching: { icon: '🦅', color: '#92400e', gradient: 'from-amber-600 to-yellow-600' },
    gardening: { icon: '🌱', color: '#16a34a', gradient: 'from-green-400 to-green-600' },
    
    // Travel & Tours
    tour: { icon: '🗺️', color: '#0891b2', gradient: 'from-cyan-400 to-cyan-600' },
    sightseeing: { icon: '👀', color: '#0891b2', gradient: 'from-cyan-400 to-cyan-600' },
    travel: { icon: '✈️', color: '#2563eb', gradient: 'from-blue-400 to-blue-600' },
    expedition: { icon: '🎒', color: '#ea580c', gradient: 'from-orange-400 to-orange-600' }
  };
  
  // Try exact match first
  if (typeMapping[type]) {
    return { ...typeMapping[type], label: eventType };
  }
  
  // Try substring matching with priority order
  const keywords = Object.keys(typeMapping).sort((a, b) => b.length - a.length); // Longer keywords first
  
  for (const keyword of keywords) {
    if (type.includes(keyword) || keyword.includes(type)) {
      return { ...typeMapping[keyword], label: eventType };
    }
  }
  
  // Advanced keyword matching for compound words
  const words = type.split(/[\s\-_]+/); // Split on spaces, hyphens, underscores
  for (const word of words) {
    if (typeMapping[word]) {
      return { ...typeMapping[word], label: eventType };
    }
  }
  
  // Default for truly unknown types
  return { 
    icon: '📅', 
    color: '#6b7280', 
    gradient: 'from-gray-400 to-gray-600',
    label: eventType 
  };
};

const MapControls = ({ onFilterChange, selectedFilter, eventCounts, availableTypes }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="absolute top-4 left-4 z-50">
      {/* Filter Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 px-4 py-3 flex items-center space-x-2 hover:bg-white transition-all duration-200"
        style={{ zIndex: 50 }}
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
        <div 
          className="mt-2 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-200 p-2 min-w-[200px] max-h-80 overflow-y-auto"
          style={{ zIndex: 60 }}
        >
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

const FreeMapView = ({ events, selectedEvent, onEventSelect, onEventDeselect, onShowChat, userLocation, onLocationRefresh }) => {
  const { user, joinEvent, leaveEvent } = useAuth();
  const [mapCenter, setMapCenter] = useState([19.0760, 72.8777]); // Default fallback
  const [filter, setFilter] = useState('all');
  const [hoveredEventId, setHoveredEventId] = useState(null);

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

  // Update map center when user location is available
  useEffect(() => {
    if (userLocation && userLocation.lat && userLocation.lng) {
      setMapCenter([userLocation.lat, userLocation.lng]);
    }
  }, [userLocation]);

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
        zoomControl={false}
        scrollWheelZoom={true}
        doubleClickZoom={true}
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
            isHovered={hoveredEventId === event.id}
            onHover={(eventId) => setHoveredEventId(eventId)}
            onLeaveHover={() => setHoveredEventId(null)}
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
      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-3" style={{ zIndex: 40 }}>
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
        <div className="text-xs text-gray-500 text-center flex items-center space-x-1">
          <button
            onClick={onLocationRefresh}
            className="flex items-center space-x-1 hover:text-emerald-600 transition-colors cursor-pointer"
            title="Refresh location"
          >
            <span>📍</span>
            <span>{userLocation ? userLocation.city : 'Detecting...'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FreeMapView;