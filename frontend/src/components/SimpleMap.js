import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const SimpleMap = ({ events, onShowChat, onJoin, onLeave, currentUserId }) => {
  const position = [19.0760, 72.8777]; // Mumbai

  return (
    <div style={{ height: 'calc(100vh - 4rem)', width: '100%' }}>
      <MapContainer 
        center={position} 
        zoom={10} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {events.map((event) => (
          <Marker key={event.id} position={[event.location.lat, event.location.lng]}>
            <Popup>
              <div className="p-3">
                <h3 className="font-bold text-lg mb-2">{event.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                <p className="text-xs text-gray-500">📍 {event.location.address}</p>
                <div className="mt-2 flex gap-2">
                  {!event.participants?.includes(currentUserId) ? (
                    <button
                      onClick={() => onJoin(event.id)}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded"
                    >
                      Join
                    </button>
                  ) : (
                    <button
                      onClick={() => onLeave(event.id)}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded"
                    >
                      Leave
                    </button>
                  )}
                  <button
                    onClick={() => onShowChat(event)}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded"
                  >
                    Chat
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default SimpleMap;