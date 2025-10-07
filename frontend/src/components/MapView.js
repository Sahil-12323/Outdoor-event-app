import React, { useState, useCallback, useEffect } from 'react';
import { Map, AdvancedMarker, InfoWindow, useAdvancedMarkerRef } from '@vis.gl/react-google-maps';
import { useAuth } from '../App';

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

const EventMarker = ({ event, isSelected, onSelect, onJoin, onLeave, onShowChat, currentUserId }) => {
  const [markerRef, marker] = useAdvancedMarkerRef();
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
    <>
      <AdvancedMarker
        ref={markerRef}
        position={event.location}
        onClick={onSelect}
        title={event.title}
        data-testid={`event-marker-${event.id}`}
      >
        <div className="custom-marker">
          <div 
            className="event-marker-pin"
            style={{ backgroundColor: config.color }}
          >
            <div className="event-marker-pulse" style={{ backgroundColor: config.color }} />
            <span className="event-marker-icon">{config.icon}</span>
          </div>
        </div>
      </AdvancedMarker>

      {isSelected && marker && (
        <InfoWindow 
          anchor={marker}
          onCloseClick={() => onSelect(null)}
          data-testid="event-info-window"
        >
          <div className="event-info-window">
            <div className="event-info-header">
              <h3 className="text-lg font-bold text-gray-900 pr-4">{event.title}</h3>
              <span className="event-type-badge">{config.label}</span>
            </div>

            <div className="space-y-3">
              <p className="text-gray-600 text-sm leading-relaxed">
                {event.description}
              </p>

              <div className="event-details-grid">
                <div className="event-detail-item">
                  <span className="event-detail-icon">📍</span>
                  <div>
                    <div className="font-medium text-gray-900">Location</div>
                    <div className="text-sm text-gray-600">{event.location.address}</div>
                  </div>
                </div>

                <div className="event-detail-item">
                  <span className="event-detail-icon">📅</span>
                  <div>
                    <div className="font-medium text-gray-900">Date & Time</div>
                    <div className="text-sm text-gray-600">{formatDate(event.event_date)}</div>
                  </div>
                </div>

                <div className="event-detail-item">
                  <span className="event-detail-icon">👥</span>
                  <div>
                    <div className="font-medium text-gray-900">Participants</div>
                    <div className="text-sm text-gray-600">
                      {event.participants?.length || 0}
                      {event.capacity && ` / ${event.capacity}`} joined
                    </div>
                  </div>
                </div>
              </div>

              <div className="event-actions">
                {!isCreator && (
                  <>
                    {!isParticipant ? (
                      <button
                        onClick={() => onJoin(event.id)}
                        className="event-btn event-btn-primary"
                        data-testid="join-event-btn"
                      >
                        ✓ Join Event
                      </button>
                    ) : (
                      <button
                        onClick={() => onLeave(event.id)}
                        className="event-btn event-btn-danger"
                        data-testid="leave-event-btn"
                      >
                        ✗ Leave Event
                      </button>
                    )}
                  </>
                )}

                {(isParticipant || isCreator) && (
                  <button
                    onClick={() => onShowChat(event)}
                    className="event-btn event-btn-chat"
                    data-testid="chat-btn"
                  >
                    💬 Chat
                  </button>
                )}

                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${event.location.lat},${event.location.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="event-btn event-btn-secondary"
                  data-testid="directions-btn"
                >
                  🧭 Directions
                </a>
              </div>
            </div>
          </div>
        </InfoWindow>
      )}
    </>
  );
};

const MapControls = ({ onFilterChange, selectedFilter }) => {
  const eventTypes = Object.entries(EVENT_TYPE_CONFIG);

  return (
    <div className="map-controls">
      <div className="mb-2">
        <button
          onClick={() => onFilterChange('all')}
          className={`map-control-btn w-full text-xs px-2 py-1 ${
            selectedFilter === 'all' ? 'bg-emerald-100 text-emerald-700' : ''
          }`}
        >
          All Events
        </button>
      </div>
      
      {eventTypes.map(([type, config]) => (
        <button
          key={type}
          onClick={() => onFilterChange(type)}
          className={`map-control-btn ${
            selectedFilter === type ? 'bg-emerald-100 text-emerald-700' : ''
          }`}
          title={config.label}
        >
          <span style={{ color: config.color }}>{config.icon}</span>
        </button>
      ))}
    </div>
  );
};

const MapView = ({ events, selectedEvent, onEventSelect, onEventDeselect, onShowChat }) => {
  const { user, joinEvent, leaveEvent } = useAuth();
  const [mapCenter, setMapCenter] = useState({ lat: 37.7749, lng: -122.4194 }); // San Francisco default
  const [mapZoom, setMapZoom] = useState(10);
  const [filter, setFilter] = useState('all');

  // Get user's location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setMapZoom(12);
        },
        (error) => {
          console.log('Geolocation error:', error);
          // Keep default location
        }
      );
    }
  }, []);

  // Filter events based on selected filter
  const filteredEvents = events.filter(event => 
    filter === 'all' || event.event_type === filter
  );

  const handleMarkerClick = useCallback((event) => {
    onEventSelect(event);
  }, [onEventSelect]);

  const handleMapClick = useCallback(() => {
    if (selectedEvent) {
      onEventDeselect();
    }
  }, [selectedEvent, onEventDeselect]);

  return (
    <div className="map-container" data-testid="map-container">
      <Map
        style={{ width: '100%', height: '100%' }}
        defaultCenter={mapCenter}
        defaultZoom={mapZoom}
        gestureHandling="greedy"
        disableDefaultUI={false}
        mapId="outdoor_events_map"
        onClick={handleMapClick}
        options={{
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }]
            }
          ],
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true
        }}
        data-testid="google-map"
      >
        {filteredEvents.map((event) => (
          <EventMarker
            key={event.id}
            event={event}
            isSelected={selectedEvent?.id === event.id}
            onSelect={() => handleMarkerClick(event)}
            onJoin={joinEvent}
            onLeave={leaveEvent}
            onShowChat={onShowChat}
            currentUserId={user?.id}
          />
        ))}
      </Map>

      <MapControls 
        onFilterChange={setFilter} 
        selectedFilter={filter}
      />

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 max-w-xs">
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
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg px-3 py-2">
        <div className="text-sm font-medium text-gray-900">
          {filteredEvents.length} {filteredEvents.length === 1 ? 'Event' : 'Events'}
        </div>
        <div className="text-xs text-gray-500">
          {filter === 'all' ? 'All types' : EVENT_TYPE_CONFIG[filter]?.label}
        </div>
      </div>
    </div>
  );
};

export default MapView;