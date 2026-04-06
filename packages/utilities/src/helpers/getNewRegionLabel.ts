import type { Region } from '@linode/api-v4';

export const getNewRegionLabel = (region: Region) => {
  const [city] = region.label.split(', ');
  // Include state for the US
  if (region.country === 'us') {
    return `${region.country.toUpperCase()}, ${region.label}`;
  }
  return `${region.country.toUpperCase()}, ${city}`;
};
