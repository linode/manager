import { Stack, TooltipIcon } from '@linode/ui';
import { capitalizeAllWords } from '@linode/utilities';
import React from 'react';

import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';

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

  if (
    event &&
    event.status === 'failed' &&
    event.action === 'image_upload' &&
    image.status === 'pending_upload'
  ) {
    // If we have a recent image upload failure, we show the user
    // that the upload failed and why.
    return (
      <Stack alignItems="center" direction="row">
        <StatusIcon status="error" />
        Upload Failed
        {event.message && (
          <TooltipIcon sxTooltipIcon={{ ml: 1, p: 0 }} text={event.message} />
        )}
      </Stack>
    );
  }

  const imageRegionStatus = image.regions.find(
    (r) => r.status !== 'available'
  )?.status;

  if (imageRegionStatus) {
    // If we have any non-available region statuses, expose the first one as the Image's status to the user
    return (
      <Stack direction="row">
        <StatusIcon status={imageStatusIconMap[imageRegionStatus]} />
        {capitalizeAllWords(imageRegionStatus)}
      </Stack>
    );
  }

  const showEventProgress =
    event && event.status === 'started' && event.percent_complete !== null;

  return (
    <Stack direction="row">
      <StatusIcon status={imageStatusIconMap[image.status]} />
      {capitalizeAllWords(image.status.replace('_', ' '))}
      {showEventProgress && ` (${event.percent_complete}%)`}
    </Stack>
  );
};
