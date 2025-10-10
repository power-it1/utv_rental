// Utility functions for vehicle-related operations

export function getVehicleIcon(type: string): string {
  switch (type) {
    case 'motorcycle':
      return '🏍️';
    case 'utv':
      return '🚙'; // SUV/jeep icon for UTVs
    case 'guided_tour':
      return '🗺️';
    default:
      return '🚗';
  }
}

export function getVehicleTypeName(type: string): string {
  switch (type) {
    case 'motorcycle':
      return 'Motorcycle';
    case 'utv':
      return 'UTV';
    case 'guided_tour':
      return 'Guided Tour';
    default:
      return 'Vehicle';
  }
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function getVehiclePlaceholderImage(type: string): string {
  switch (type) {
    case 'motorcycle':
      return 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&q=80';
    case 'utv':
      return '/utv-placeholder.svg';
    case 'guided_tour':
      return 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=800&q=80';
    default:
      return 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80';
  }
}
