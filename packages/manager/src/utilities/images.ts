import type { Image } from '@linode/api-v4';

const isRecentlyDeleted = (i: Image) =>
  i.created_by === null && i.type === 'automatic';
const isByLinode = (i: Image) =>
  i.created_by !== null && i.created_by === 'linode';
const isDeprecated = (i: Image) => i.deprecated === true;
const isRecommended = (i: Image) => isByLinode(i) && !isDeprecated(i);
const isOlderImage = (i: Image) => isByLinode(i) && isDeprecated(i);

export const getImageGroup = (image: Image) => {
  if (isRecentlyDeleted(image)) {
    return 'Recently Deleted Disks';
  }
  if (isRecommended(image)) {
    return '64-bit Distributions - Recommended';
  }
  if (isOlderImage(image)) {
    return 'Older Distributions';
  }
  return 'Images';
};
