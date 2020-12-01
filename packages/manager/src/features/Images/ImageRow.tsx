import { Event } from '@linode/api-v4/lib/account';
import { Image } from '@linode/api-v4/lib/images';
import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import LinearProgress from 'src/components/LinearProgress';
import RenderGuard from 'src/components/RenderGuard';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/core/TableRow';
import { formatDate } from 'src/utilities/formatDate';
import ActionMenu, { Handlers } from './ImagesActionMenu';

const useStyles = makeStyles((theme: Theme) => ({
  label: {
    width: '30%',
    [theme.breakpoints.down('sm')]: {
      width: '100%'
    }
  },
  loadingStatus: {
    marginBottom: theme.spacing(1) / 2
  }
}));

export interface ImageWithEvent extends Image {
  event?: Event;
}

type CombinedProps = Handlers & ImageWithEvent;

const ImageRow: React.FC<CombinedProps> = props => {
  const classes = useStyles();
  const {
    created,
    description,
    event,
    expiry,
    id,
    label,
    size,
    ...rest
  } = props;

  return isImageUpdating(event) ? (
    <TableRow key={id} data-qa-image-cell={id}>
      <TableCell
        parentColumn="Label"
        className={classes.label}
        data-qa-image-label
      >
        <ProgressDisplay
          className={classes.loadingStatus}
          text="Creating"
          progress={progressFromEvent(event)}
        />
        {label}
      </TableCell>
      <TableCell colSpan={4}>
        <LinearProgress value={progressFromEvent(event)} />
      </TableCell>
    </TableRow>
  ) : (
    <TableRow key={id} data-qa-image-cell={id}>
      <TableCell
        parentColumn="Label"
        className={classes.label}
        data-qa-image-label
      >
        {label}
      </TableCell>
      <TableCell parentColumn="Created" data-qa-image-date>
        {formatDate(created)}
      </TableCell>
      <TableCell parentColumn="Expires" data-qa-image-date>
        {expiry ? formatDate(expiry) : 'Never'}
      </TableCell>
      <TableCell parentColumn="Size" data-qa-image-size>
        {size} MB
      </TableCell>
      <TableCell>
        <ActionMenu id={id} label={label} description={description} {...rest} />
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
  className: string;
  progress: undefined | number;
  text: string;
}> = props => {
  const { progress, text, className } = props;
  const displayProgress = progress ? `${progress}%` : `scheduled`;

  return (
    <Typography variant="body2" className={className}>
      {text}: {displayProgress}
    </Typography>
  );
};

export default RenderGuard(ImageRow);
