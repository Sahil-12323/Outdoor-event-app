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

  // Popular locations in India for outdoor activities
  const popularLocations = [
    { name: "Mumbai", full: "Mumbai, Maharashtra, India", type: "city" },
    { name: "Pune", full: "Pune, Maharashtra, India", type: "city" },
    { name: "Bangalore", full: "Bangalore, Karnataka, India", type: "city" },
    { name: "Delhi", full: "Delhi, India", type: "city" },
    { name: "Goa", full: "Goa, India", type: "state" },
    { name: "Manali", full: "Manali, Himachal Pradesh, India", type: "hill_station" },
    { name: "Rishikesh", full: "Rishikesh, Uttarakhand, India", type: "adventure" },
    { name: "Ooty", full: "Ooty, Tamil Nadu, India", type: "hill_station" },
    { name: "Lonavala", full: "Lonavala, Maharashtra, India", type: "hill_station" },
    { name: "Mahabaleshwar", full: "Mahabaleshwar, Maharashtra, India", type: "hill_station" },
    { name: "Sanjay Gandhi National Park", full: "Sanjay Gandhi National Park, Mumbai, Maharashtra", type: "park" },
    { name: "Marine Drive", full: "Marine Drive, Mumbai, Maharashtra", type: "landmark" },
    { name: "Gateway of India", full: "Gateway of India, Mumbai, Maharashtra", type: "landmark" },
    { name: "Juhu Beach", full: "Juhu Beach, Mumbai, Maharashtra", type: "beach" },
    { name: "Karnala Fort", full: "Karnala Fort, Panvel, Maharashtra", type: "fort" }
  ];

  // Search for location suggestions (hybrid approach)
  const searchLocationSuggestions = async (input) => {
    if (!input.trim() || input.length < 2) {
      setLocationSuggestions([]);
      setShowLocationDropdown(false);
      return;
    }
    
    setIsLoadingPlaces(true);
    
    // Filter popular locations first
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

    setLocationSuggestions(suggestions.slice(0, 5));
    setShowLocationDropdown(suggestions.length > 0);
    setIsLoadingPlaces(false);

    // Optional: Try Google Places API as backup (if CORS allows)
    try {
      const corsProxy = 'https://api.allorigins.win/raw?url=';
      const placesUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&components=country:in`;
      
      const response = await fetch(corsProxy + encodeURIComponent(placesUrl));
      if (response.ok) {
        const data = await response.json();
        if (data.predictions && data.predictions.length > 0) {
          const googleSuggestions = data.predictions.slice(0, 3).map(pred => ({
            ...pred,
            place_id: `google_${pred.place_id}`
          }));
          setLocationSuggestions([...suggestions.slice(0, 2), ...googleSuggestions]);
        }
      }
    } catch (error) {
      // Silently fail for Google Places API, use popular locations only
      console.log('Google Places API not accessible, using local suggestions');
    }
  };

  // Select a location suggestion
  const selectLocationSuggestion = async (suggestion) => {
    const address = suggestion.description;
    setFormData(prev => ({
      ...prev,
      location: { ...prev.location, address }
    }));
    setShowLocationDropdown(false);
    
    // Get detailed location info
    await geocodeAddress(address);
  };

  const geocodeAddress = async (address) => {
    if (!address.trim()) return;
    
    setIsGeocodingLocation(true);
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          const location = data.results[0].geometry.location;
          const formattedAddress = data.results[0].formatted_address;
          
          setFormData(prev => ({
            ...prev,
            location: {
              lat: location.lat,
              lng: location.lng,
              address: formattedAddress
            }
          }));
        } else {
          setError('Address not found. Please try a different address.');
        }
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      setError('Failed to find location. Please try again.');
    } finally {
      setIsGeocodingLocation(false);
    }
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
                  placeholder="Search or select event type..."
                  value={eventTypeSearch || (formData.event_type ? EVENT_TYPES.find(t => t.value === formData.event_type)?.label : '')}
                  onChange={(e) => handleEventTypeSearch(e.target.value)}
                  onFocus={() => setShowEventTypeDropdown(true)}
                  className="cursor-pointer"
                  data-testid="event-type-search-input"
                />
                {showEventTypeDropdown && (
                  <div 
                    ref={eventTypeDropdownRef}
                    className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                    data-testid="event-type-dropdown"
                  >
                    {filteredEventTypes.length > 0 ? (
                      filteredEventTypes.map((type) => (
                        <div
                          key={type.value}
                          onClick={() => selectEventType(type)}
                          className="px-3 py-2 hover:bg-emerald-50 cursor-pointer flex items-center gap-2 border-b border-gray-100 last:border-b-0"
                          data-testid={`event-type-option-${type.value}`}
                        >
                          <span className="text-lg">{type.label.split(' ')[1]}</span>
                          <span className="text-gray-700">{type.label.split(' ')[0]}</span>
                        </div>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-gray-500 text-sm">
                        No event types found
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