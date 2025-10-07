import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

// No more hardcoded event types - users can create any type!

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

  // Event types are now free form - no more filtering needed!

  // Popular locations including cities, malls, parks, and landmarks
  const popularLocations = [
    // Cities
    { name: "Mumbai", full: "Mumbai, Maharashtra, India", type: "city", lat: 19.0760, lng: 72.8777 },
    { name: "Pune", full: "Pune, Maharashtra, India", type: "city", lat: 18.5204, lng: 73.8567 },
    { name: "Bangalore", full: "Bangalore, Karnataka, India", type: "city", lat: 12.9716, lng: 77.5946 },
    { name: "Delhi", full: "Delhi, India", type: "city", lat: 28.7041, lng: 77.1025 },
    { name: "Goa", full: "Goa, India", type: "state", lat: 15.2993, lng: 74.1240 },
    { name: "Chennai", full: "Chennai, Tamil Nadu, India", type: "city", lat: 13.0827, lng: 80.2707 },
    { name: "Hyderabad", full: "Hyderabad, Telangana, India", type: "city", lat: 17.3850, lng: 78.4867 },
    { name: "Kolkata", full: "Kolkata, West Bengal, India", type: "city", lat: 22.5726, lng: 88.3639 },
    
    // Malls - Mumbai
    { name: "Phoenix Marketcity Mumbai", full: "Phoenix Marketcity, Kurla, Mumbai", type: "mall", lat: 19.0881, lng: 72.8911 },
    { name: "Inorbit Mall Mumbai", full: "Inorbit Mall, Malad, Mumbai", type: "mall", lat: 19.1761, lng: 72.8337 },
    { name: "High Street Phoenix", full: "High Street Phoenix, Lower Parel, Mumbai", type: "mall", lat: 19.0065, lng: 72.8292 },
    { name: "R City Mall", full: "R City Mall, Ghatkopar, Mumbai", type: "mall", lat: 19.0866, lng: 72.9081 },
    { name: "Oberoi Mall", full: "Oberoi Mall, Goregaon, Mumbai", type: "mall", lat: 19.1579, lng: 72.8362 },
    { name: "Growel's 101 Mall", full: "Growel's 101 Mall, Kandivali, Mumbai", type: "mall", lat: 19.2102, lng: 72.8471 },
    
    // Malls - Pune
    { name: "Phoenix Marketcity Pune", full: "Phoenix Marketcity, Viman Nagar, Pune", type: "mall", lat: 18.5679, lng: 73.9143 },
    { name: "Amanora Town Centre", full: "Amanora Town Centre, Hadapsar, Pune", type: "mall", lat: 18.5089, lng: 73.9249 },
    { name: "Seasons Mall Pune", full: "Seasons Mall, Magarpatta, Pune", type: "mall", lat: 18.5139, lng: 73.9359 },
    
    // Malls - Bangalore
    { name: "Phoenix Marketcity Bangalore", full: "Phoenix Marketcity, Whitefield, Bangalore", type: "mall", lat: 12.9976, lng: 77.6978 },
    { name: "UB City Bangalore", full: "UB City Mall, Vittal Mallya Road, Bangalore", type: "mall", lat: 12.9719, lng: 77.5997 },
    { name: "Orion Mall Bangalore", full: "Orion Mall, Rajajinagar, Bangalore", type: "mall", lat: 12.9887, lng: 77.5431 },
    { name: "Forum Mall Koramangala", full: "Forum Mall, Koramangala, Bangalore", type: "mall", lat: 12.9346, lng: 77.6119 },
    { name: "Mantri Square Mall", full: "Mantri Square Mall, Malleshwaram, Bangalore", type: "mall", lat: 13.0042, lng: 77.5709 },
    
    // Malls - Delhi/NCR
    { name: "Select Citywalk Delhi", full: "Select Citywalk, Saket, New Delhi", type: "mall", lat: 28.5245, lng: 77.2174 },
    { name: "DLF Mall of India", full: "DLF Mall of India, Noida", type: "mall", lat: 28.5677, lng: 77.3269 },
    { name: "Ambience Mall Gurgaon", full: "Ambience Mall, Gurgaon, Haryana", type: "mall", lat: 28.4743, lng: 77.0711 },
    { name: "DLF Promenade", full: "DLF Promenade, Vasant Kunj, Delhi", type: "mall", lat: 28.5244, lng: 77.1582 },
    { name: "Pacific Mall Delhi", full: "Pacific Mall, Subhash Nagar, Delhi", type: "mall", lat: 28.6402, lng: 77.1047 },
    
    // Parks & Recreation
    { name: "Sanjay Gandhi National Park", full: "Sanjay Gandhi National Park, Mumbai", type: "park", lat: 19.2094, lng: 72.9570 },
    { name: "Chhatrapati Shivaji Park", full: "Chhatrapati Shivaji Park, Mumbai", type: "park", lat: 19.0260, lng: 72.8397 },
    { name: "Cubbon Park", full: "Cubbon Park, Bangalore", type: "park", lat: 12.9763, lng: 77.5928 },
    { name: "Lalbagh Gardens", full: "Lalbagh Botanical Garden, Bangalore", type: "park", lat: 12.9507, lng: 77.5848 },
    { name: "Lodhi Garden", full: "Lodhi Garden, New Delhi", type: "park", lat: 28.5933, lng: 77.2180 },
    { name: "India Gate", full: "India Gate, New Delhi", type: "landmark", lat: 28.6129, lng: 77.2295 },
    
    // Beaches
    { name: "Juhu Beach", full: "Juhu Beach, Mumbai", type: "beach", lat: 19.1075, lng: 72.8263 },
    { name: "Versova Beach", full: "Versova Beach, Mumbai", type: "beach", lat: 19.1349, lng: 72.8114 },
    { name: "Marina Beach", full: "Marina Beach, Chennai", type: "beach", lat: 13.0499, lng: 80.2824 },
    { name: "Calangute Beach", full: "Calangute Beach, Goa", type: "beach", lat: 15.5394, lng: 73.7554 },
    { name: "Baga Beach", full: "Baga Beach, Goa", type: "beach", lat: 15.5557, lng: 73.7516 },
    
    // Heritage & Landmarks
    { name: "Gateway of India", full: "Gateway of India, Mumbai", type: "landmark", lat: 18.9220, lng: 72.8347 },
    { name: "Marine Drive", full: "Marine Drive, Mumbai", type: "landmark", lat: 18.9434, lng: 72.8234 },
    { name: "Elephanta Caves", full: "Elephanta Caves, Mumbai", type: "heritage", lat: 18.9633, lng: 72.9314 },
    { name: "Taj Mahal", full: "Taj Mahal, Agra", type: "heritage", lat: 27.1751, lng: 78.0421 },
    { name: "Qutub Minar", full: "Qutub Minar, New Delhi", type: "heritage", lat: 28.5245, lng: 77.1855 },
    { name: "Red Fort", full: "Red Fort, New Delhi", type: "heritage", lat: 28.6562, lng: 77.2410 },
    
    // Hill Stations
    { name: "Manali", full: "Manali, Himachal Pradesh", type: "hill_station", lat: 32.2396, lng: 77.1887 },
    { name: "Rishikesh", full: "Rishikesh, Uttarakhand", type: "adventure", lat: 30.0869, lng: 78.2676 },
    { name: "Ooty", full: "Ooty, Tamil Nadu", type: "hill_station", lat: 11.4102, lng: 76.6950 },
    { name: "Lonavala", full: "Lonavala, Maharashtra", type: "hill_station", lat: 18.7537, lng: 73.4074 },
    { name: "Mahabaleshwar", full: "Mahabaleshwar, Maharashtra", type: "hill_station", lat: 17.9234, lng: 73.6581 },
    
    // Restaurants & Cafes (Popular chains)
    { name: "Bandra Kurla Complex", full: "Bandra Kurla Complex, Mumbai", type: "business", lat: 19.0664, lng: 72.8679 },
    { name: "Connaught Place", full: "Connaught Place, New Delhi", type: "business", lat: 28.6315, lng: 77.2167 },
    { name: "MG Road Bangalore", full: "MG Road, Bangalore", type: "business", lat: 12.9750, lng: 77.6060 },
    { name: "Koramangala", full: "Koramangala, Bangalore", type: "locality", lat: 12.9279, lng: 77.6271 },
    { name: "Powai Lake", full: "Powai Lake, Mumbai", type: "lake", lat: 19.1197, lng: 72.9078 }
  ];

  // Search for location suggestions using OpenStreetMap Nominatim API (FREE!)
  const searchLocationSuggestions = async (input) => {
    if (!input.trim() || input.length < 2) {
      setLocationSuggestions([]);
      setShowLocationDropdown(false);
      return;
    }
    
    setIsLoadingPlaces(true);
    
    try {
      // Use OpenStreetMap Nominatim API for location search
      // This is completely FREE and doesn't require an API key!
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `q=${encodeURIComponent(input)}&` +
        `format=json&` +
        `limit=8&` +
        `addressdetails=1`,
        {
          headers: {
            'Accept': 'application/json',
            // Be a good citizen - identify your app
            'User-Agent': 'TrailMeet Event App'
          }
        }
      );

      if (response.ok) {
        const places = await response.json();
        
        // Transform OpenStreetMap results to our format
        const suggestions = places.map(place => ({
          place_id: place.place_id,
          description: place.display_name,
          structured_formatting: {
            main_text: place.name || place.display_name.split(',')[0],
            secondary_text: place.display_name.split(',').slice(1).join(',').trim()
          },
          lat: parseFloat(place.lat),
          lng: parseFloat(place.lon),
          osm_type: place.type
        }));

        setLocationSuggestions(suggestions);
        setShowLocationDropdown(suggestions.length > 0);
      } else {
        // Fallback to popular locations if API fails
        const filteredPopular = popularLocations.filter(loc =>
          loc.name.toLowerCase().includes(input.toLowerCase()) ||
          loc.full.toLowerCase().includes(input.toLowerCase())
        );

        const suggestions = filteredPopular.map((loc, index) => ({
          place_id: `popular_${index}`,
          description: loc.full,
          structured_formatting: {
            main_text: loc.name,
            secondary_text: loc.full.replace(loc.name + ', ', '')
          },
          lat: loc.lat,
          lng: loc.lng
        }));

        setLocationSuggestions(suggestions.slice(0, 8));
        setShowLocationDropdown(suggestions.length > 0);
      }
    } catch (error) {
      console.error('Location search error:', error);
      
      // Fallback to popular locations on error
      const filteredPopular = popularLocations.filter(loc =>
        loc.name.toLowerCase().includes(input.toLowerCase()) ||
        loc.full.toLowerCase().includes(input.toLowerCase())
      );

      const suggestions = filteredPopular.map((loc, index) => ({
        place_id: `popular_${index}`,
        description: loc.full,
        structured_formatting: {
          main_text: loc.name,
          secondary_text: loc.full.replace(loc.name + ', ', '')
        },
        lat: loc.lat,
        lng: loc.lng
      }));

      setLocationSuggestions(suggestions.slice(0, 8));
      setShowLocationDropdown(suggestions.length > 0);
    } finally {
      setIsLoadingPlaces(false);
    }
  };

  // Select a location suggestion
  const selectLocationSuggestion = async (suggestion) => {
    const address = suggestion.description;
    
    // If suggestion already has coordinates (from OpenStreetMap), use them directly
    if (suggestion.lat && suggestion.lng) {
      setFormData(prev => ({
        ...prev,
        location: {
          lat: suggestion.lat,
          lng: suggestion.lng,
          address: address
        }
      }));
      setShowLocationDropdown(false);
      setError(''); // Clear any previous errors
      return;
    }
    
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
      // For other locations, try geocoding with OpenStreetMap
      setFormData(prev => ({
        ...prev,
        location: { ...prev.location, address }
      }));
      setShowLocationDropdown(false);
      await geocodeAddressWithOSM(address);
    }
  };

  // Geocode address using OpenStreetMap Nominatim API
  const geocodeAddressWithOSM = async (address) => {
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
      
      // Use OpenStreetMap Nominatim for geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `q=${encodeURIComponent(address)}&` +
        `format=json&` +
        `limit=1`,
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'TrailMeet Event App'
          }
        }
      );

      if (response.ok) {
        const results = await response.json();
        
        if (results && results.length > 0) {
          const place = results[0];
          setFormData(prev => ({
            ...prev,
            location: {
              lat: parseFloat(place.lat),
              lng: parseFloat(place.lon),
              address: place.display_name || address
            }
          }));
        } else {
          // Fallback to default coordinates if no results
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
            setError('Location not found. Please select from the dropdown suggestions.');
          }
        }
      } else {
        setError('Unable to find location. Please select from the dropdown suggestions.');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      setError('Unable to process location. Please select from the dropdown suggestions.');
    } finally {
      setIsGeocodingLocation(false);
    }
  };

  // Keep original function for backward compatibility
  const geocodeAddress = geocodeAddressWithOSM;
  
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