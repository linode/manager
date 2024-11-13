import { Stack } from '@linode/ui';
import React from 'react';

import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { TooltipIcon } from 'src/components/TooltipIcon';
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

  if (event && event.status === 'failed' && image.status === 'pending_upload') {
    return (
      <Stack alignItems="center" direction="row">
        <StatusIcon status="error" />
        Upload Failed
        {event.message && (
          <TooltipIcon
            status="help"
            sxTooltipIcon={{ ml: 1, p: 0 }}
            text={event.message}
          />
        )}
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

  const showEventProgress =
    event &&
    event.status === 'started' &&
    event.percent_complete !== null &&
    event.percent_complete > 0;

  return (
    <Stack direction="row">
      <StatusIcon status={imageStatusIconMap[image.status]} />
      {capitalizeAllWords(image.status.replace('_', ' '))}
      {showEventProgress && ` (${event.percent_complete}%)`}
    </Stack>
  );
};
