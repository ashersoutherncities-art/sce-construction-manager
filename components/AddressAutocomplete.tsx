import { useEffect, useRef, useState, useCallback } from 'react';

interface AddressComponents {
  streetAddress: string;
  city: string;
  state: string;
  zip: string;
  fullAddress: string;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onAddressSelect?: (components: AddressComponents) => void;
  name: string;
  required?: boolean;
  className?: string;
  placeholder?: string;
}

function parseAddressComponents(place: google.maps.places.PlaceResult): AddressComponents {
  const components: AddressComponents = {
    streetAddress: '',
    city: '',
    state: '',
    zip: '',
    fullAddress: place.formatted_address || '',
  };

  if (!place.address_components) return components;

  let streetNumber = '';
  let route = '';

  for (const component of place.address_components) {
    const types = component.types;
    if (types.includes('street_number')) {
      streetNumber = component.long_name;
    } else if (types.includes('route')) {
      route = component.long_name;
    } else if (types.includes('locality') || types.includes('sublocality_level_1')) {
      components.city = component.long_name;
    } else if (types.includes('administrative_area_level_1')) {
      components.state = component.short_name;
    } else if (types.includes('postal_code')) {
      components.zip = component.long_name;
    }
  }

  components.streetAddress = streetNumber ? `${streetNumber} ${route}` : route;
  return components;
}

export default function AddressAutocomplete({
  value,
  onChange,
  onAddressSelect,
  name,
  required = false,
  className = '',
  placeholder,
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const isAutocompleteActive = useRef(false);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.warn('⚠️ Google Maps API key not configured. Address autocomplete disabled.');
      setIsLoaded(false);
      return;
    }

    if (window.google && window.google.maps && window.google.maps.places) {
      setIsLoaded(true);
      return;
    }

    setIsLoading(true);
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;

    (window as any).initGoogleMaps = () => {
      setIsLoaded(true);
      setIsLoading(false);
    };

    script.onerror = () => {
      setError('Failed to load Google Maps API. Check your API key.');
      setIsLoading(false);
    };

    document.head.appendChild(script);

    return () => {
      delete (window as any).initGoogleMaps;
    };
  }, []);

  const stableOnAddressSelect = useRef(onAddressSelect);
  stableOnAddressSelect.current = onAddressSelect;
  const stableOnChange = useRef(onChange);
  stableOnChange.current = onChange;

  useEffect(() => {
    if (!isLoaded || !inputRef.current) return;

    try {
      const inputElement = inputRef.current;

      const autocompleteInstance = new google.maps.places.Autocomplete(inputElement, {
        types: ['address'],
        componentRestrictions: { country: 'us' },
        fields: ['formatted_address', 'address_components', 'geometry'],
      });

      autocompleteInstance.addListener('place_changed', () => {
        const place = autocompleteInstance.getPlace();
        if (place.formatted_address) {
          isAutocompleteActive.current = false;
          stableOnChange.current(place.formatted_address);

          // Parse and emit address components
          if (stableOnAddressSelect.current) {
            const parsed = parseAddressComponents(place);
            stableOnAddressSelect.current(parsed);
          }
        }
      });

      const handleFocus = () => { isAutocompleteActive.current = true; };
      const handleBlur = () => {
        setTimeout(() => { isAutocompleteActive.current = false; }, 200);
      };

      inputElement.addEventListener('focus', handleFocus);
      inputElement.addEventListener('blur', handleBlur);
      autocompleteRef.current = autocompleteInstance;

      return () => {
        inputElement.removeEventListener('focus', handleFocus);
        inputElement.removeEventListener('blur', handleBlur);
        if (autocompleteRef.current) {
          google.maps.event.clearInstanceListeners(autocompleteRef.current);
        }
      };
    } catch (err) {
      console.error('Error initializing autocomplete:', err);
      setError('Failed to initialize address autocomplete');
    }
  }, [isLoaded]);

  useEffect(() => {
    if (inputRef.current && !isAutocompleteActive.current) {
      inputRef.current.value = value;
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const hasApiKey = !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const defaultPlaceholder = isLoaded
    ? 'Start typing an address...'
    : hasApiKey && isLoading
    ? 'Loading address suggestions...'
    : 'Enter property address';

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
        placeholder={placeholder || defaultPlaceholder}
        autoComplete="off"
        aria-label="Property Address"
      />

      {isLoading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-sce-orange"></div>
        </div>
      )}

      {!hasApiKey && (
        <div className="mt-1 text-xs text-yellow-600">
          ℹ️ Autocomplete disabled — API key not configured.
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
