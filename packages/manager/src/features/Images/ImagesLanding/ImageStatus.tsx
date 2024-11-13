import { Stack } from '@linode/ui';
import React from 'react';

import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { capitalizeAllWords } from 'src/utilities/capitalize';

import { imageStatusIconMap } from './ImageRegions/ImageRegionRow';

import type { Event, Image } from '@linode/api-v4';

interface Props {
  /**
   * The most revent event associated with this Image
   */
  event: Event | undefined;
  /**
   * The Image object
   */
  image: Image;
}

export const ImageStatus = (props: Props) => {
  const { event, image } = props;

  const isFailedUpload =
    image.status === 'pending_upload' && event?.status === 'failed';

  if (isFailedUpload) {
    return (
      <Stack direction="row">
        <StatusIcon status="error" />
        Upload Failed
      </Stack>
    );
  }

  const imageRegionStatus = image.regions.find((r) => r.status !== 'available')
    ?.status;

  if (imageRegionStatus) {
    return (
      <Stack direction="row">
        <StatusIcon status={imageStatusIconMap[imageRegionStatus]} />
        {capitalizeAllWords(imageRegionStatus)}
      </Stack>
    );
  }

  return (
    <Stack direction="row">
      <StatusIcon status={imageStatusIconMap[image.status]} />
      {capitalizeAllWords(image.status.replace('_', ' '))}
      {event && event.percent_complete && `(${event.percent_complete}%)`}
    </Stack>
  );
};
