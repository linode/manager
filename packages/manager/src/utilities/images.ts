import { DateTime } from 'luxon';

import { MAX_MONTHS_EOL_FILTER } from 'src/constants';

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

export const filterImageForStackScript = (
  image: Image,
  variant: 'all' | 'private' | 'public'
) => {
  const { eol } = image;
  const differenceInMonths = DateTime.now().diff(
    DateTime.fromISO(eol!),
    'months'
  ).months;

  if (eol && differenceInMonths > MAX_MONTHS_EOL_FILTER) {
    return false;
  }

  const isKubeImage = image.label.match(/kube/i);

  switch (variant) {
    case 'public':
      /*
       * Get all public images but exclude any Kubernetes images.
       * We don't want them to show up as a selectable image to deploy since
       * the Kubernetes images are used behind the scenes with LKE.
       */
      return image.is_public && image.status === 'available' && !isKubeImage;
    case 'private':
      return !image.is_public && image.status === 'available';
    case 'all':
      // We don't show images with 'kube' in the label that are created by Linode
      return !(isKubeImage && image.created_by === 'linode');
    default:
      return true;
  }
};
