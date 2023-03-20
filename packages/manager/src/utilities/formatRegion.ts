export const getHumanReadableCountry = (regionSlug: string) => {
  if (regionSlug.match(/(us)/gim)) {
    return 'United States';
  }
  if (regionSlug.match(/(ca)/gim)) {
    return 'Canada';
  }
  if (regionSlug.match(/(de|uk|eu)/gim)) {
    return 'Europe';
  }
  if (regionSlug.match(/(jp|sg|in|ap)/gim)) {
    return 'Asia';
  }
  return 'Other';
};

export const isEURegion = (region: string | null | undefined) =>
  region?.match('^eu');
