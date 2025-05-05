import { useProfile } from '@linode/queries';
import { Stack, Tooltip } from '@linode/ui';
import { Hidden } from '@linode/ui';
import { convertStorageUnit, pluralize } from '@linode/utilities';
import React from 'react';

import CloudInitIcon from 'src/assets/icons/cloud-init.svg';
import UnlockIcon from 'src/assets/icons/unlock.svg';
import { LinkButton } from 'src/components/LinkButton';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { formatDate } from 'src/utilities/formatDate';

import { ImagesActionMenu } from './ImagesActionMenu';
import { ImageStatus } from './ImageStatus';

import type { Handlers } from './ImagesActionMenu';
import type { Event, Image } from '@linode/api-v4';

interface Props {
  event?: Event;
  handlers: Handlers;
  image: Image;
}

export const ImageRow = (props: Props) => {
  const { event, handlers, image } = props;

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
    type,
  } = image;

  const { data: profile } = useProfile();

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
        <Stack
          alignItems="center"
          direction="row"
          gap={2}
          justifyContent="space-between"
        >
          {label}
          <Stack alignItems="center" direction="row" gap={1}>
            {type === 'manual' &&
              status !== 'creating' &&
              !image.capabilities.includes('distributed-sites') && (
                <Tooltip title="This image is not encrypted. You can recreate the image to enable encryption and then delete this image.">
                  <div style={{ display: 'flex' }}>
                    <UnlockIcon height="20px" width="20px" />
                  </div>
                </Tooltip>
              )}
            {type === 'manual' && capabilities.includes('cloud-init') && (
              <Tooltip title="This image supports our Metadata service via cloud-init.">
                <div style={{ display: 'flex' }}>
                  <CloudInitIcon />
                </div>
              </Tooltip>
            )}
          </Stack>
        </Stack>
      </TableCell>
      <Hidden smDown>
        <TableCell noWrap>
          <ImageStatus event={event} image={image} />
        </TableCell>
      </Hidden>
      {type === 'manual' && (
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
      <TableCell data-qa-image-size>
        {getSizeForImage(size, status, event?.status)}
      </TableCell>
      {type === 'manual' && (
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
      {type === 'automatic' && (
        <Hidden smDown>
          <TableCell data-qa-image-date>
            {expiry
              ? formatDate(expiry, {
                  timezone: profile?.timezone,
                })
              : 'N/A'}
          </TableCell>
        </Hidden>
      )}
      {type === 'manual' && (
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
