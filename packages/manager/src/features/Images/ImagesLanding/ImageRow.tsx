import { Stack, Tooltip } from '@linode/ui';
import React from 'react';

import CloudInitIcon from 'src/assets/icons/cloud-init.svg';
import { Hidden } from 'src/components/Hidden';
import { LinkButton } from 'src/components/LinkButton';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { useFlags } from 'src/hooks/useFlags';
import { useProfile } from 'src/queries/profile/profile';
import { formatDate } from 'src/utilities/formatDate';
import { pluralize } from 'src/utilities/pluralize';
import { convertStorageUnit } from 'src/utilities/unitConversions';

import { ImagesActionMenu } from './ImagesActionMenu';
import { ImageStatus } from './ImageStatus';

import type { Handlers } from './ImagesActionMenu';
import type { Event, Image, ImageCapabilities } from '@linode/api-v4';

const capabilityMap: Record<ImageCapabilities, string> = {
  'cloud-init': 'Cloud-init',
  'distributed-sites': 'Distributed',
};

interface Props {
  event?: Event;
  handlers: Handlers;
  image: Image;
  multiRegionsEnabled?: boolean; // TODO Image Service v2: delete after GA
}

export const ImageRow = (props: Props) => {
  const { event, handlers, image, multiRegionsEnabled } = props;

  const {
    capabilities,
    created,
    expiry,
    id,
    label,
    regions,
    size,
    status,
    total_size,
  } = image;

  const { data: profile } = useProfile();
  const flags = useFlags();

  const compatibilitiesList = multiRegionsEnabled
    ? capabilities.map((capability) => capabilityMap[capability]).join(', ')
    : '';

  const isFailedUpload =
    image.status === 'pending_upload' && event?.status === 'failed';

  const getSizeForImage = (
    size: number,
    status: string,
    eventStatus: string | undefined
  ) => {
    if (status === 'available' || eventStatus === 'finished') {
      const sizeInGB = convertStorageUnit('MB', size, 'GB');

      const formattedSizeInGB = Intl.NumberFormat('en-US', {
        maximumFractionDigits: 2,
        minimumFractionDigits: 0,
      }).format(sizeInGB);

      return `${formattedSizeInGB} GB`;
    } else if (isFailedUpload) {
      return 'N/A';
    } else {
      return 'Pending';
    }
  };

  return (
    <TableRow data-qa-image-cell={id} key={id}>
      <TableCell data-qa-image-label noWrap>
        {capabilities.includes('cloud-init') &&
        flags.imageServiceGen2 &&
        flags.imageServiceGen2Ga ? (
          <Stack alignItems="center" direction="row" gap={1.5}>
            <Tooltip title="This image supports our Metadata service via cloud-init.">
              <div style={{ display: 'flex' }}>
                <CloudInitIcon />
              </div>
            </Tooltip>
            {label}
          </Stack>
        ) : (
          label
        )}
      </TableCell>
      <Hidden smDown>
        <TableCell noWrap>
          <ImageStatus event={event} image={image} />
        </TableCell>
      </Hidden>
      {multiRegionsEnabled && (
        <Hidden smDown>
          <TableCell>
            {regions.length > 0 ? (
              <LinkButton onClick={() => handlers.onManageRegions?.(image)}>
                {pluralize('Region', 'Regions', regions.length)}
              </LinkButton>
            ) : (
              'N/A'
            )}
          </TableCell>
        </Hidden>
      )}
      {multiRegionsEnabled && !flags.imageServiceGen2Ga && (
        <Hidden smDown>
          <TableCell>{compatibilitiesList}</TableCell>
        </Hidden>
      )}
      <TableCell data-qa-image-size>
        {getSizeForImage(size, status, event?.status)}
      </TableCell>
      {multiRegionsEnabled && (
        <Hidden mdDown>
          <TableCell>
            {getSizeForImage(total_size, status, event?.status)}
          </TableCell>
        </Hidden>
      )}
      <Hidden mdDown>
        <TableCell data-qa-image-date>
          {formatDate(created, {
            timezone: profile?.timezone,
          })}
        </TableCell>
      </Hidden>
      <Hidden smDown>
        {expiry && (
          <TableCell data-qa-image-date>
            {formatDate(expiry, {
              timezone: profile?.timezone,
            })}
          </TableCell>
        )}
      </Hidden>
      {multiRegionsEnabled && (
        <Hidden mdDown>
          <TableCell>{id}</TableCell>
        </Hidden>
      )}
      <TableCell actionCell>
        <ImagesActionMenu {...props} />
      </TableCell>
    </TableRow>
  );
};
