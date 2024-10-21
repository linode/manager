import React from 'react';

import CloudInitIcon from 'src/assets/icons/cloud-init.svg';
import { Hidden } from 'src/components/Hidden';
import { LinkButton } from 'src/components/LinkButton';
import { Stack } from 'src/components/Stack';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { Tooltip } from 'src/components/Tooltip';
import { Typography } from 'src/components/Typography';
import { useFlags } from 'src/hooks/useFlags';
import { useProfile } from 'src/queries/profile/profile';
import { capitalizeAllWords } from 'src/utilities/capitalize';
import { formatDate } from 'src/utilities/formatDate';
import { pluralize } from 'src/utilities/pluralize';
import { convertStorageUnit } from 'src/utilities/unitConversions';

import { ImagesActionMenu } from './ImagesActionMenu';

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

  const isFailed = status === 'pending_upload' && event?.status === 'failed';

  const compatibilitiesList = multiRegionsEnabled
    ? capabilities.map((capability) => capabilityMap[capability]).join(', ')
    : '';

  const getStatusForImage = (status: string) => {
    switch (status) {
      case 'creating':
        return (
          <ProgressDisplay
            progress={progressFromEvent(event)}
            text="Creating"
          />
        );
      case 'available':
        return 'Ready';
      case 'pending_upload':
        return isFailed ? 'Failed' : 'Processing';
      default:
        return capitalizeAllWords(status.replace('_', ' '));
    }
  };

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
    } else if (isFailed) {
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
        <TableCell>{getStatusForImage(status)}</TableCell>
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

export const isImageUpdating = (e?: Event) => {
  // Make Typescript happy, since this function can otherwise technically return undefined
  if (!e) {
    return false;
  }
  return (
    e?.action === 'disk_imagize' && ['scheduled', 'started'].includes(e.status)
  );
};

const progressFromEvent = (e?: Event) => {
  return e?.status === 'started' && e?.percent_complete
    ? e.percent_complete
    : undefined;
};

const ProgressDisplay: React.FC<{
  progress: number | undefined;
  text: string;
}> = (props) => {
  const { progress, text } = props;
  const displayProgress = progress ? `${progress}%` : `scheduled`;

  return (
    <Typography variant="body1">
      {text}: {displayProgress}
    </Typography>
  );
};
