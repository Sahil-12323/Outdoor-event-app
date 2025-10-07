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
  hiking: { color: '#059669', icon: '🥾', label: 'Hiking' },
  camping: { color: '#0d9488', icon: '⛺', label: 'Camping' },
  cycling: { color: '#0891b2', icon: '🚴', label: 'Cycling' },
  sports: { color: '#2563eb', icon: '⚽', label: 'Sports' },
  workshop: { color: '#7c3aed', icon: '🎨', label: 'Workshop' },
  festival: { color: '#dc2626', icon: '🎪', label: 'Festival' },
  climbing: { color: '#ea580c', icon: '🧗', label: 'Climbing' },
  kayaking: { color: '#0284c7', icon: '🛶', label: 'Kayaking' },
  running: { color: '#16a34a', icon: '🏃', label: 'Running' }
};

// Create custom colored markers for different event types
const createCustomIcon = (eventType) => {
  const config = EVENT_TYPE_CONFIG[eventType] || EVENT_TYPE_CONFIG.hiking;
  
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
  const config = EVENT_TYPE_CONFIG[event.event_type] || EVENT_TYPE_CONFIG.hiking;
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

const MapControls = ({ onFilterChange, selectedFilter }) => {
  const eventTypes = Object.entries(EVENT_TYPE_CONFIG);

  return (
    <div className="absolute top-4 left-4 z-1000 bg-white rounded-lg shadow-lg p-2 space-y-1">
      <div className="mb-2">
        <button
          onClick={() => onFilterChange('all')}
          className={`w-full text-xs px-2 py-1 rounded transition-colors ${
            selectedFilter === 'all' 
              ? 'bg-emerald-100 text-emerald-700 font-medium' 
              : 'hover:bg-gray-100'
          }`}
        >
          All Events
        </button>
      </div>
      
      {eventTypes.map(([type, config]) => (
        <button
          key={type}
          onClick={() => onFilterChange(type)}
          className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-colors ${
            selectedFilter === type 
              ? 'bg-emerald-100 ring-2 ring-emerald-500' 
              : 'hover:bg-gray-100'
          }`}
          title={config.label}
        >
          <span style={{ color: config.color }}>{config.icon}</span>
        </button>
      ))}
    </div>
  );
};

const FreeMapView = ({ events, selectedEvent, onEventSelect, onEventDeselect, onShowChat }) => {
  const { user, joinEvent, leaveEvent } = useAuth();
  const [mapCenter, setMapCenter] = useState([19.0760, 72.8777]); // Mumbai default
  const [filter, setFilter] = useState('all');

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
      />

      {/* Event Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 max-w-xs z-1000">
        <h4 className="font-semibold text-gray-900 mb-2 text-sm">Event Types</h4>
        <div className="grid grid-cols-2 gap-1 text-xs">
          {Object.entries(EVENT_TYPE_CONFIG).slice(0, 6).map(([type, config]) => (
            <div key={type} className="flex items-center gap-1">
              <span style={{ color: config.color }}>{config.icon}</span>
              <span className="text-gray-600">{config.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Event Count */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg px-3 py-2 z-1000">
        <div className="text-sm font-medium text-gray-900">
          {filteredEvents.length} {filteredEvents.length === 1 ? 'Event' : 'Events'}
        </div>
        <div className="text-xs text-gray-500">
          {filter === 'all' ? 'All types' : EVENT_TYPE_CONFIG[filter]?.label}
        </div>
      </div>

      {/* Free Map Attribution */}
      <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg px-2 py-1 z-1000">
        <div className="text-xs text-gray-500">
          🆓 Free OpenStreetMap
        </div>
      </div>
    </div>
  );
};

export default FreeMapView;