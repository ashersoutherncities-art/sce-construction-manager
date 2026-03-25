// Google Maps TypeScript definitions
declare global {
  interface Window {
    google: typeof google;
  }
}

declare namespace google.maps {
  namespace places {
    class Autocomplete {
      constructor(
        inputField: HTMLInputElement,
        opts?: AutocompleteOptions
      );
      addListener(eventName: string, handler: () => void): void;
      getPlace(): PlaceResult;
    }

    interface AutocompleteOptions {
      types?: string[];
      componentRestrictions?: { country: string | string[] };
      fields?: string[];
    }

    interface PlaceResult {
      formatted_address?: string;
      address_components?: AddressComponent[];
      geometry?: {
        location: {
          lat(): number;
          lng(): number;
        };
      };
    }

    interface AddressComponent {
      long_name: string;
      short_name: string;
      types: string[];
    }
  }

  namespace event {
    function clearInstanceListeners(instance: any): void;
  }
}

export {};
