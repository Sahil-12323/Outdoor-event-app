import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const EVENT_TYPES = [
  { value: 'hiking', label: 'Hiking 🥾' },
  { value: 'camping', label: 'Camping ⛺' },
  { value: 'cycling', label: 'Cycling 🚴' },
  { value: 'sports', label: 'Sports ⚽' },
  { value: 'workshop', label: 'Workshop 🎨' },
  { value: 'festival', label: 'Festival 🎪' },
  { value: 'climbing', label: 'Climbing 🧗' },
  { value: 'kayaking', label: 'Kayaking 🛶' },
  { value: 'running', label: 'Running 🏃' }
];

const EventForm = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: '',
    location: {
      lat: '',
      lng: '',
      address: ''
    },
    event_date: '',
    capacity: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isGeocodingLocation, setIsGeocodingLocation] = useState(false);
  
  // Location autocomplete states
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);
  const locationInputRef = useRef(null);
  const locationDropdownRef = useRef(null);
  
  // Event type search states  
  const [eventTypeSearch, setEventTypeSearch] = useState('');
  const [showEventTypeDropdown, setShowEventTypeDropdown] = useState(false);
  const eventTypeInputRef = useRef(null);
  const eventTypeDropdownRef = useRef(null);

  const handleInputChange = (field, value) => {
    if (field.includes('location.')) {
      const locationField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // Handle location input change with autocomplete
  const handleLocationInputChange = (value) => {
    handleInputChange('location.address', value);
    if (value.length > 2) {
      searchLocationSuggestions(value);
    } else {
      setLocationSuggestions([]);
      setShowLocationDropdown(false);
    }
  };

  // Handle event type search
  const handleEventTypeSearch = (value) => {
    setEventTypeSearch(value);
    setShowEventTypeDropdown(true);
  };

  // Filter event types based on search
  const filteredEventTypes = EVENT_TYPES.filter(type =>
    type.label.toLowerCase().includes(eventTypeSearch.toLowerCase())
  );

  const selectEventType = (type) => {
    setFormData(prev => ({ ...prev, event_type: type.value }));
    setEventTypeSearch(type.label);
    setShowEventTypeDropdown(false);
  };

  // Popular locations in India for outdoor activities with coordinates
  const popularLocations = [
    { name: "Mumbai", full: "Mumbai, Maharashtra, India", type: "city", lat: 19.0760, lng: 72.8777 },
    { name: "Pune", full: "Pune, Maharashtra, India", type: "city", lat: 18.5204, lng: 73.8567 },
    { name: "Bangalore", full: "Bangalore, Karnataka, India", type: "city", lat: 12.9716, lng: 77.5946 },
    { name: "Delhi", full: "Delhi, India", type: "city", lat: 28.7041, lng: 77.1025 },
    { name: "Goa", full: "Goa, India", type: "state", lat: 15.2993, lng: 74.1240 },
    { name: "Manali", full: "Manali, Himachal Pradesh, India", type: "hill_station", lat: 32.2396, lng: 77.1887 },
    { name: "Rishikesh", full: "Rishikesh, Uttarakhand, India", type: "adventure", lat: 30.0869, lng: 78.2676 },
    { name: "Ooty", full: "Ooty, Tamil Nadu, India", type: "hill_station", lat: 11.4102, lng: 76.6950 },
    { name: "Lonavala", full: "Lonavala, Maharashtra, India", type: "hill_station", lat: 18.7537, lng: 73.4074 },
    { name: "Mahabaleshwar", full: "Mahabaleshwar, Maharashtra, India", type: "hill_station", lat: 17.9234, lng: 73.6581 },
    { name: "Sanjay Gandhi National Park", full: "Sanjay Gandhi National Park, Mumbai, Maharashtra", type: "park", lat: 19.2094, lng: 72.9570 },
    { name: "Marine Drive", full: "Marine Drive, Mumbai, Maharashtra", type: "landmark", lat: 18.9434, lng: 72.8234 },
    { name: "Gateway of India", full: "Gateway of India, Mumbai, Maharashtra", type: "landmark", lat: 18.9220, lng: 72.8347 },
    { name: "Juhu Beach", full: "Juhu Beach, Mumbai, Maharashtra", type: "beach", lat: 19.1075, lng: 72.8263 },
    { name: "Karnala Fort", full: "Karnala Fort, Panvel, Maharashtra", type: "fort", lat: 18.9050, lng: 73.1047 },
    { name: "Chhatrapati Shivaji Park", full: "Chhatrapati Shivaji Park, Mumbai, Maharashtra", type: "park", lat: 19.0260, lng: 72.8397 },
    { name: "Powai Lake", full: "Powai Lake, Mumbai, Maharashtra", type: "lake", lat: 19.1197, lng: 72.9078 },
    { name: "Elephanta Caves", full: "Elephanta Caves, Mumbai, Maharashtra", type: "heritage", lat: 18.9633, lng: 72.9314 }
  ];

  // Search for location suggestions (free approach)
  const searchLocationSuggestions = async (input) => {
    if (!input.trim() || input.length < 2) {
      setLocationSuggestions([]);
      setShowLocationDropdown(false);
      return;
    }
    
    setIsLoadingPlaces(true);
    
    // Filter popular locations
    const filteredPopular = popularLocations.filter(loc =>
      loc.name.toLowerCase().includes(input.toLowerCase()) ||
      loc.full.toLowerCase().includes(input.toLowerCase())
    );

    // Create suggestions in the expected format
    const suggestions = filteredPopular.map((loc, index) => ({
      place_id: `popular_${index}`,
      description: loc.full,
      structured_formatting: {
        main_text: loc.name,
        secondary_text: loc.full.replace(loc.name + ', ', '')
      }
    }));

    setLocationSuggestions(suggestions.slice(0, 8));
    setShowLocationDropdown(suggestions.length > 0);
    setIsLoadingPlaces(false);
  };

  // Select a location suggestion
  const selectLocationSuggestion = async (suggestion) => {
    const address = suggestion.description;
    
    // Check if this is a popular location with predefined coordinates
    const popularLocation = popularLocations.find(loc => 
      loc.full === address || loc.name === suggestion.structured_formatting?.main_text
    );
    
    if (popularLocation) {
      // Use predefined coordinates for popular locations
      setFormData(prev => ({
        ...prev,
        location: {
          lat: popularLocation.lat,
          lng: popularLocation.lng,
          address: popularLocation.full
        }
      }));
      setShowLocationDropdown(false);
      setError(''); // Clear any previous errors
    } else {
      // For other locations, try geocoding
      setFormData(prev => ({
        ...prev,
        location: { ...prev.location, address }
      }));
      setShowLocationDropdown(false);
      await geocodeAddress(address);
    }
  };

  const geocodeAddress = async (address) => {
    if (!address.trim()) return;
    
    setIsGeocodingLocation(true);
    setError(''); // Clear previous errors
    
    try {
      // Check if it matches any popular location by partial name
      const matchedLocation = popularLocations.find(loc => 
        address.toLowerCase().includes(loc.name.toLowerCase()) ||
        loc.full.toLowerCase().includes(address.toLowerCase())
      );
      
      if (matchedLocation) {
        setFormData(prev => ({
          ...prev,
          location: {
            lat: matchedLocation.lat,
            lng: matchedLocation.lng,
            address: matchedLocation.full
          }
        }));
        setIsGeocodingLocation(false);
        return;
      }
      
      // Fallback: try to extract city/state and use default coordinates
      const defaultCoords = getDefaultCoordinates(address);
      if (defaultCoords) {
        setFormData(prev => ({
          ...prev,
          location: {
            lat: defaultCoords.lat,
            lng: defaultCoords.lng,
            address: address
          }
        }));
      } else {
        setError('Please select from the dropdown suggestions for accurate location.');
      }
    } catch (error) {
      console.error('Location processing error:', error);
      setError('Unable to process location. Please select from the dropdown suggestions.');
    } finally {
      setIsGeocodingLocation(false);
    }
  };
  
  // Helper function to get default coordinates for common locations
  const getDefaultCoordinates = (address) => {
    const lowerAddress = address.toLowerCase();
    
    // City mappings for fallback
    const cityMappings = {
      'mumbai': { lat: 19.0760, lng: 72.8777 },
      'pune': { lat: 18.5204, lng: 73.8567 },
      'bangalore': { lat: 12.9716, lng: 77.5946 },
      'delhi': { lat: 28.7041, lng: 77.1025 },
      'goa': { lat: 15.2993, lng: 74.1240 },
      'kolkata': { lat: 22.5726, lng: 88.3639 },
      'chennai': { lat: 13.0827, lng: 80.2707 },
      'hyderabad': { lat: 17.3850, lng: 78.4867 }
    };
    
    for (const [city, coords] of Object.entries(cityMappings)) {
      if (lowerAddress.includes(city)) {
        return coords;
      }
    }
    
    return null;
  };

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(event.target) &&
          locationInputRef.current && !locationInputRef.current.contains(event.target)) {
        setShowLocationDropdown(false);
      }
      if (eventTypeDropdownRef.current && !eventTypeDropdownRef.current.contains(event.target) &&
          eventTypeInputRef.current && !eventTypeInputRef.current.contains(event.target)) {
        setShowEventTypeDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddressBlur = () => {
    // Delay to allow for dropdown selection
    setTimeout(() => {
      if (formData.location.address && !formData.location.lat && !showLocationDropdown) {
        geocodeAddress(formData.location.address);
      }
    }, 200);
  };

  const validateForm = () => {
    if (!formData.title.trim()) return 'Event title is required';
    if (!formData.description.trim()) return 'Event description is required';
    if (!formData.event_type) return 'Event type is required';
    if (!formData.location.address.trim()) return 'Event location is required';
    if (!formData.location.lat || !formData.location.lng) return 'Please wait for location to be validated or enter a valid address';
    if (!formData.event_date) return 'Event date and time is required';
    
    const eventDate = new Date(formData.event_date);
    if (eventDate < new Date()) return 'Event date must be in the future';
    
    if (formData.capacity && (parseInt(formData.capacity) < 1 || parseInt(formData.capacity) > 1000)) {
      return 'Capacity must be between 1 and 1000';
    }
    
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    
    try {
      const eventData = {
        ...formData,
        event_date: new Date(formData.event_date).toISOString(),
        location: {
          lat: parseFloat(formData.location.lat),
          lng: parseFloat(formData.location.lng),
          address: formData.location.address
        },
        capacity: formData.capacity ? parseInt(formData.capacity) : null
      };

      await onSubmit(eventData);
    } catch (error) {
      setError('Failed to create event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get current datetime for min value (can't create events in the past)
  const getCurrentDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  return (
    <div className="form-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="form-container slide-up" data-testid="event-form">
        <div className="form-header">
          <h2 className="text-xl font-bold text-gray-900">Create New Event</h2>
          <button 
            onClick={onClose}
            className="form-close-btn"
            data-testid="close-form-btn"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="e.g., Morning Hike at Mount Tamalpais"
              maxLength={200}
              required
              data-testid="event-title-input"
            />
          </div>

          <div className="form-group">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your event, what to expect, what to bring..."
              maxLength={2000}
              rows={4}
              required
              data-testid="event-description-input"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <Label htmlFor="event_type">Event Type *</Label>
              <div className="relative" ref={eventTypeInputRef}>
                <Input
                  placeholder="Enter any event type (e.g., hiking, movie, concert, workshop...)"
                  value={eventTypeSearch || formData.event_type}
                  onChange={(e) => {
                    const value = e.target.value;
                    setEventTypeSearch(value);
                    setFormData(prev => ({ ...prev, event_type: value }));
                    if (value.length > 0) {
                      setShowEventTypeDropdown(true);
                    } else {
                      setShowEventTypeDropdown(false);
                    }
                  }}
                  onFocus={() => {
                    if (eventTypeSearch || formData.event_type) {
                      setShowEventTypeDropdown(true);
                    }
                  }}
                  className="cursor-text"
                  data-testid="event-type-search-input"
                  required
                />
                {showEventTypeDropdown && (eventTypeSearch || formData.event_type) && (
                  <div 
                    ref={eventTypeDropdownRef}
                    className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                    data-testid="event-type-dropdown"
                  >
                    {/* Popular suggestions */}
                    <div className="px-3 py-2 text-xs text-gray-500 font-medium border-b border-gray-100">
                      Popular Types:
                    </div>
                    {['hiking', 'movie', 'concert', 'workshop', 'cycling', 'food', 'photography', 'yoga', 'gaming', 'party'].map((type) => (
                      <div
                        key={type}
                        onClick={() => {
                          setFormData(prev => ({ ...prev, event_type: type }));
                          setEventTypeSearch(type);
                          setShowEventTypeDropdown(false);
                        }}
                        className="px-3 py-2 hover:bg-emerald-50 cursor-pointer flex items-center gap-2 border-b border-gray-100 last:border-b-0 capitalize"
                        data-testid={`event-type-option-${type}`}
                      >
                        <span className="text-sm">{type}</span>
                      </div>
                    ))}
                    
                    {/* Current input as option */}
                    {(eventTypeSearch || formData.event_type) && 
                     !['hiking', 'movie', 'concert', 'workshop', 'cycling', 'food', 'photography', 'yoga', 'gaming', 'party'].includes((eventTypeSearch || formData.event_type).toLowerCase()) && (
                      <div
                        onClick={() => {
                          setFormData(prev => ({ ...prev, event_type: eventTypeSearch || formData.event_type }));
                          setShowEventTypeDropdown(false);
                        }}
                        className="px-3 py-2 hover:bg-emerald-50 cursor-pointer flex items-center gap-2 border-t border-gray-200 bg-emerald-50"
                      >
                        <span className="text-emerald-600 font-medium">✓ Use "{eventTypeSearch || formData.event_type}"</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <Label htmlFor="capacity">Max Participants</Label>
              <Input
                id="capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => handleInputChange('capacity', e.target.value)}
                placeholder="Optional"
                min="1"
                max="1000"
                data-testid="event-capacity-input"
              />
            </div>
          </div>

          <div className="form-group">
            <Label htmlFor="address">Location *</Label>
            <div className="relative" ref={locationInputRef}>
              <Input
                id="address"
                value={formData.location.address}
                onChange={(e) => handleLocationInputChange(e.target.value)}
                onBlur={handleAddressBlur}
                placeholder="Start typing location (e.g., Mumbai, Pune, Bangalore...)"
                required
                data-testid="event-address-input"
              />
              
              {showLocationDropdown && locationSuggestions.length > 0 && (
                <div 
                  ref={locationDropdownRef}
                  className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                  data-testid="location-suggestions"
                >
                  {locationSuggestions.map((suggestion, index) => (
                    <div
                      key={suggestion.place_id || index}
                      onClick={() => selectLocationSuggestion(suggestion)}
                      className="px-3 py-2 hover:bg-emerald-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      data-testid={`location-suggestion-${index}`}
                    >
                      <div className="font-medium text-gray-900">
                        {suggestion.structured_formatting?.main_text || suggestion.description}
                      </div>
                      {suggestion.structured_formatting?.secondary_text && (
                        <div className="text-sm text-gray-500">
                          {suggestion.structured_formatting.secondary_text}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {isLoadingPlaces && (
              <p className="text-sm text-blue-600 mt-1">🔍 Searching locations...</p>
            )}
            {isGeocodingLocation && (
              <p className="text-sm text-blue-600 mt-1">📍 Finding location details...</p>
            )}
            {formData.location.lat && formData.location.lng && (
              <p className="text-sm text-green-600 mt-1">✓ Location confirmed</p>
            )}
          </div>

          <div className="form-group">
            <Label htmlFor="event_date">Date & Time *</Label>
            <Input
              id="event_date"
              type="datetime-local"
              value={formData.event_date}
              onChange={(e) => handleInputChange('event_date', e.target.value)}
              min={getCurrentDateTime()}
              required
              data-testid="event-date-input"
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            className="form-submit-btn"
            disabled={isSubmitting || isGeocodingLocation}
            data-testid="submit-event-btn"
          >
            {isSubmitting ? (
              <>
                <div className="loading-spinner w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                Creating Event...
              </>
            ) : (
              'Create Event'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default EventForm;