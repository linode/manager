import { Event } from '@linode/api-v4/lib/account';
import { Image } from '@linode/api-v4/lib/images';
import * as React from 'react';
import Hidden from 'src/components/core/Hidden';
import { makeStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import TableCell from 'src/components/TableCell/TableCell_CMR';
import TableRow from 'src/components/TableRow/TableRow_CMR';
import { capitalizeAllWords } from 'src/utilities/capitalize';
import { formatDate } from 'src/utilities/formatDate';
import ActionMenu, { Handlers } from './ImagesActionMenu';

const useStyles = makeStyles(() => ({
  actionMenu: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
}));

export interface ImageWithEvent extends Image {
  event?: Event;
}

type CombinedProps = Handlers & ImageWithEvent;

const ImageRow: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();

  const {
    created,
    description,
    event,
    expiry,
    id,
    label,
    size,
    status,
    ...rest
  } = props;

  const getStatusForImage = (status: string) => {
    switch (status) {
      case 'creating':
        return (
          <ProgressDisplay
            text="Creating"
            progress={progressFromEvent(event)}
          />
        );
      case 'available':
        return 'Ready';
      case 'pending_upload':
        return event?.status === 'failed' ? 'Failed' : 'Pending Upload';
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
    } else if (status === 'pending_upload' && eventStatus === 'failed') {
      return 'N/A';
    } else {
      return 'Pending';
    }
  };

  return (
    <TableRow key={id} data-qa-image-cell={id}>
      <TableCell data-qa-image-label>{label}</TableCell>
      <Hidden xsDown>
        {status ? <TableCell>{getStatusForImage(status)}</TableCell> : null}
        <TableCell data-qa-image-date>{formatDate(created)}</TableCell>
      </Hidden>
      <TableCell data-qa-image-size>
        {getSizeForImage(size, status, event?.status)}
      </TableCell>
      <Hidden xsDown>
        {expiry ? (
          <TableCell data-qa-image-date>{formatDate(expiry)}</TableCell>
        ) : null}
      </Hidden>
      <TableCell className={classes.actionMenu}>
        {event?.status !== 'failed' ? (
          <ActionMenu
            id={id}
            label={label}
            description={description}
            status={status}
            {...rest}
          />
        ) : null}
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
  progress: undefined | number;
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
