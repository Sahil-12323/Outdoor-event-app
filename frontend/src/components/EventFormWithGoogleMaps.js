import React, { useState, useEffect, useRef } from 'react';
<parameter name="Button">from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

const EventFormWithGoogleMaps = ({ onClose, onSubmit }) => {
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
  const autocompleteService = useRef(null);
  const placesService = useRef(null);
  const geocoder = useRef(null);
  
  // Event type search states  
  const [eventTypeSearch, setEventTypeSearch] = useState('');
  const [showEventTypeDropdown, setShowEventTypeDropdown] = useState(false);
  const eventTypeInputRef = useRef(null);
  const eventTypeDropdownRef = useRef(null);

  // Initialize Google Maps services
  useEffect(() => {
    if (GOOGLE_MAPS_API_KEY && window.google) {
      autocompleteService.current = new window.google.maps.places.AutocompleteService();
      geocoder.current = new window.google.maps.Geocoder();
      
      // Create a hidden div for PlacesService (it requires a map or div)
      const placesDiv = document.createElement('div');
      placesService.current = new window.google.maps.places.PlacesService(placesDiv);
    }
  }, []);

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

  // Handle location input change with Google Places Autocomplete
  const handleLocationInputChange = (value) => {
    handleInputChange('location.address', value);
    if (value.length > 2) {
      searchLocationSuggestionsWithGoogle(value);
    } else {
      setLocationSuggestions([]);
      setShowLocationDropdown(false);
    }
  };

  // Search using Google Places Autocomplete API
  const searchLocationSuggestionsWithGoogle = async (input) => {
    if (!input.trim() || input.length < 2) {
      setLocationSuggestions([]);
      setShowLocationDropdown(false);
      return;
    }
    
    setIsLoadingPlaces(true);

    if (GOOGLE_MAPS_API_KEY && autocompleteService.current) {
      // Use Google Places Autocomplete
      try {
        autocompleteService.current.getPlacePredictions(
          {
            input: input,
            // You can add location bias for better results
            // locationBias: { radius: 100000, center: { lat: 19.0760, lng: 72.8777 } }
          },
          (predictions, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
              setLocationSuggestions(predictions);
              setShowLocationDropdown(true);
            } else {
              setLocationSuggestions([]);
              setShowLocationDropdown(false);
            }
            setIsLoadingPlaces(false);
          }
        );
      } catch (error) {
        console.error('Google Places error:', error);
        setLocationSuggestions([]);
        setIsLoadingPlaces(false);
      }
    } else {
      // Fallback to basic search if no API key
      await searchLocationSuggestionsFallback(input);
    }
  };

  // Fallback search (without Google Maps)
  const searchLocationSuggestionsFallback = async (input) => {
    const popularLocations = [
      { name: "Mumbai", full: "Mumbai, Maharashtra, India", lat: 19.0760, lng: 72.8777 },
      { name: "Phoenix Marketcity Mumbai", full: "Phoenix Marketcity, Kurla, Mumbai", lat: 19.0881, lng: 72.8911 },
      { name: "Inorbit Mall Mumbai", full: "Inorbit Mall, Malad, Mumbai", lat: 19.1761, lng: 72.8337 },
      { name: "Pune", full: "Pune, Maharashtra, India", lat: 18.5204, lng: 73.8567 },
      { name: "Phoenix Marketcity Pune", full: "Phoenix Marketcity, Viman Nagar, Pune", lat: 18.5679, lng: 73.9143 },
      { name: "Bangalore", full: "Bangalore, Karnataka, India", lat: 12.9716, lng: 77.5946 },
      { name: "Phoenix Marketcity Bangalore", full: "Phoenix Marketcity, Whitefield, Bangalore", lat: 12.9976, lng: 77.6978 },
      { name: "UB City Bangalore", full: "UB City Mall, Vittal Mallya Road, Bangalore", lat: 12.9719, lng: 77.5997 },
      { name: "Delhi", full: "Delhi, India", lat: 28.7041, lng: 77.1025 },
      { name: "Select Citywalk Delhi", full: "Select Citywalk, Saket, New Delhi", lat: 28.5245, lng: 77.2174 },
      { name: "DLF Mall of India", full: "DLF Mall of India, Noida", lat: 28.5677, lng: 77.3269 },
      { name: "Ambience Mall Gurgaon", full: "Ambience Mall, Gurgaon", lat: 28.4743, lng: 77.0711 }
    ];

    const filtered = popularLocations.filter(loc =>
      loc.name.toLowerCase().includes(input.toLowerCase()) ||
      loc.full.toLowerCase().includes(input.toLowerCase())
    );

    const suggestions = filtered.map((loc, index) => ({
      place_id: `popular_${index}`,
      description: loc.full,
      structured_formatting: {
        main_text: loc.name,
        secondary_text: loc.full.replace(loc.name + ', ', '')
      },
      coords: { lat: loc.lat, lng: loc.lng }
    }));

    setLocationSuggestions(suggestions.slice(0, 8));
    setShowLocationDropdown(suggestions.length > 0);
    setIsLoadingPlaces(false);
  };

  // Select a location suggestion
  const selectLocationSuggestion = async (suggestion) => {
    setFormData(prev => ({
      ...prev,
      location: { ...prev.location, address: suggestion.description }
    }));
    setShowLocationDropdown(false);

    if (GOOGLE_MAPS_API_KEY && geocoder.current) {
      // Use Google Geocoder to get coordinates
      setIsGeocodingLocation(true);
      try {
        geocoder.current.geocode(
          { placeId: suggestion.place_id },
          (results, status) => {
            if (status === 'OK' && results[0]) {
              const location = results[0].geometry.location;
              setFormData(prev => ({
                ...prev,
                location: {
                  lat: location.lat(),
                  lng: location.lng(),
                  address: results[0].formatted_address
                }
              }));
              setError('');
            } else {
              setError('Could not get location coordinates');
            }
            setIsGeocodingLocation(false);
          }
        );
      } catch (error) {
        console.error('Geocoding error:', error);
        setError('Failed to get location coordinates');
        setIsGeocodingLocation(false);
      }
    } else if (suggestion.coords) {
      // Use fallback coordinates
      setFormData(prev => ({
        ...prev,
        location: {
          lat: suggestion.coords.lat,
          lng: suggestion.coords.lng,
          address: suggestion.description
        }
      }));
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

  const validateForm = () => {
    if (!formData.title.trim()) return 'Event title is required';
    if (!formData.description.trim()) return 'Event description is required';
    if (!formData.event_type) return 'Event type is required';
    if (!formData.location.address.trim()) return 'Event location is required';
    if (!formData.location.lat || !formData.location.lng) return 'Please select a location from the dropdown';
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

        {!GOOGLE_MAPS_API_KEY && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>💡 Tip:</strong> Add Google Maps API key to search for any location (malls, restaurants, etc.). 
              See <code className="bg-yellow-100 px-1">ENABLE_GOOGLE_MAPS.md</code>
            </p>
          </div>
        )}

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
                  placeholder="Enter any event type (e.g., hiking, movie, concert...)"
                  value={eventTypeSearch || formData.event_type}
                  onChange={(e) => {
                    const value = e.target.value;
                    setEventTypeSearch(value);
                    setFormData(prev => ({ ...prev, event_type: value }));
                    setShowEventTypeDropdown(value.length > 0);
                  }}
                  onFocus={() => setShowEventTypeDropdown(!!(eventTypeSearch || formData.event_type))}
                  data-testid="event-type-search-input"
                  required
                />
                {showEventTypeDropdown && (eventTypeSearch || formData.event_type) && (
                  <div 
                    ref={eventTypeDropdownRef}
                    className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                  >
                    <div className="px-3 py-2 text-xs text-gray-500 font-medium border-b">
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
                        className="px-3 py-2 hover:bg-emerald-50 cursor-pointer border-b last:border-b-0 capitalize"
                      >
                        {type}
                      </div>
                    ))}
                    
                    {!['hiking', 'movie', 'concert', 'workshop', 'cycling', 'food', 'photography', 'yoga', 'gaming', 'party'].includes((eventTypeSearch || formData.event_type).toLowerCase()) && (
                      <div
                        onClick={() => {
                          setFormData(prev => ({ ...prev, event_type: eventTypeSearch || formData.event_type }));
                          setShowEventTypeDropdown(false);
                        }}
                        className="px-3 py-2 hover:bg-emerald-50 cursor-pointer border-t bg-emerald-50"
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
            <Label htmlFor="address">
              Location * 
              {GOOGLE_MAPS_API_KEY && <span className="text-xs text-green-600 ml-2">✓ Google Maps Enabled</span>}
            </Label>
            <div className="relative" ref={locationInputRef}>
              <Input
                id="address"
                value={formData.location.address}
                onChange={(e) => handleLocationInputChange(e.target.value)}
                placeholder={GOOGLE_MAPS_API_KEY ? "Search any location, mall, restaurant..." : "Start typing location..."}
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
                      className="px-3 py-2 hover:bg-emerald-50 cursor-pointer border-b last:border-b-0"
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

export default EventFormWithGoogleMaps;