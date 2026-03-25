import { useEffect, useRef, useState } from 'react';

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  name: string;
  required?: boolean;
  className?: string;
}

export default function AddressAutocomplete({
  value,
  onChange,
  name,
  required = false,
  className = '',
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  
  // BUG FIX: Track if we're in the middle of autocomplete interaction
  // This prevents React from fighting with Google's DOM manipulation
  const isAutocompleteActive = useRef(false);

  useEffect(() => {
    // Check if Google Maps API key is configured
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.warn('⚠️ Google Maps API key not configured. Address autocomplete disabled.');
      console.warn('📝 See GOOGLE_MAPS_SETUP.md for setup instructions');
      setIsLoaded(false);
      return;
    }

    // Check if script is already loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      setIsLoaded(true);
      return;
    }

    // Load Google Maps Places API script
    setIsLoading(true);
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;
    
    // Create global callback
    (window as any).initGoogleMaps = () => {
      setIsLoaded(true);
      setIsLoading(false);
      console.log('✅ Google Maps API loaded successfully');
    };

    script.onerror = () => {
      setError('Failed to load Google Maps API. Check your API key and network connection.');
      setIsLoading(false);
      console.error('❌ Failed to load Google Maps API');
    };
    
    document.head.appendChild(script);

    return () => {
      // Cleanup
      delete (window as any).initGoogleMaps;
    };
  }, []);

  useEffect(() => {
    if (!isLoaded || !inputRef.current) return;

    try {
      const inputElement = inputRef.current;
      
      // Initialize autocomplete
      const autocompleteInstance = new google.maps.places.Autocomplete(inputElement, {
        types: ['address'],
        componentRestrictions: { country: 'us' }, // Restrict to US addresses
        fields: ['formatted_address', 'address_components', 'geometry'],
      });
      
      // Listen for place selection
      autocompleteInstance.addListener('place_changed', () => {
        const place = autocompleteInstance.getPlace();
        if (place.formatted_address) {
          isAutocompleteActive.current = false;
          onChange(place.formatted_address);
          console.log('📍 Address selected:', place.formatted_address);
        }
      });

      // BUG FIX: Detect when user is interacting with autocomplete dropdown
      // This prevents React from overwriting Google's DOM changes
      const handleFocus = () => {
        isAutocompleteActive.current = true;
      };
      
      const handleBlur = () => {
        // Small delay to allow place_changed to fire first
        setTimeout(() => {
          isAutocompleteActive.current = false;
        }, 200);
      };

      inputElement.addEventListener('focus', handleFocus);
      inputElement.addEventListener('blur', handleBlur);

      autocompleteRef.current = autocompleteInstance;
      console.log('🗺️ Address autocomplete initialized');
      
      return () => {
        // Cleanup
        inputElement.removeEventListener('focus', handleFocus);
        inputElement.removeEventListener('blur', handleBlur);
        if (autocompleteRef.current) {
          google.maps.event.clearInstanceListeners(autocompleteRef.current);
        }
      };
    } catch (error) {
      console.error('Error initializing autocomplete:', error);
      setError('Failed to initialize address autocomplete');
    }
  }, [isLoaded, onChange]);

  // Sync the input value when value prop changes externally
  useEffect(() => {
    if (inputRef.current && !isAutocompleteActive.current) {
      inputRef.current.value = value;
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // BUG FIX: Always notify parent of value changes
    // but let the DOM value be the source of truth during autocomplete
    onChange(e.target.value);
  };

  const hasApiKey = !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        name={name}
        defaultValue={value}
        onChange={handleInputChange}
        required={required}
        className={className}
        placeholder={
          isLoaded
            ? 'Start typing an address... (e.g., 123 Main St)'
            : hasApiKey && isLoading
            ? 'Loading address suggestions...'
            : 'Enter property address'
        }
        autoComplete="off"
        aria-label="Property Address"
      />
      
      {/* Loading Spinner */}
      {isLoading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-sce-orange"></div>
        </div>
      )}

      {/* Status Badge */}
      {!hasApiKey && (
        <div className="mt-1 text-xs text-yellow-600">
          ℹ️ Autocomplete disabled. See GOOGLE_MAPS_SETUP.md to enable suggestions.
        </div>
      )}

      {error && (
        <div className="mt-1 text-xs text-red-600">
          ⚠️ {error}
        </div>
      )}

      {isLoaded && (
        <div className="mt-1 text-xs text-green-600">
          ✓ Address suggestions enabled
        </div>
      )}
    </div>
  );
}
