import { Event, Image } from '@linode/api-v4';
import * as React from 'react';

import { Hidden } from 'src/components/Hidden';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { Typography } from 'src/components/Typography';
import { useProfile } from 'src/queries/profile/profile';
import { capitalizeAllWords } from 'src/utilities/capitalize';
import { formatDate } from 'src/utilities/formatDate';

import { Handlers, ImagesActionMenu } from './ImagesActionMenu';

interface Props {
  event?: Event;
  handlers: Handlers;
  image: Image;
}

const ImageRow = (props: Props) => {
  const { event, image } = props;

  const { created, expiry, id, label, size, status } = image;

  const { data: profile } = useProfile();

  const isFailed = status === 'pending_upload' && event?.status === 'failed';

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
      return `${size} MB`;
    } else if (isFailed) {
      return 'N/A';
    } else {
      return 'Pending';
    }
  };

  return (
    <TableRow data-qa-image-cell={id} key={id}>
      <TableCell data-qa-image-label>{label}</TableCell>
      <Hidden smDown>
        {status ? <TableCell>{getStatusForImage(status)}</TableCell> : null}
        <TableCell data-qa-image-date>
          {formatDate(created, {
            timezone: profile?.timezone,
          })}
        </TableCell>
      </Hidden>
      <TableCell data-qa-image-size>
        {getSizeForImage(size, status, event?.status)}
      </TableCell>
      <Hidden smDown>
        {expiry ? (
          <TableCell data-qa-image-date>
            {formatDate(expiry, {
              timezone: profile?.timezone,
            })}
          </TableCell>
        ) : null}
      </Hidden>
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

export default React.memo(ImageRow);
