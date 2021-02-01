import { Event } from '@linode/api-v4/lib/account';
import { Image } from '@linode/api-v4/lib/images';
import * as React from 'react';
import Hidden from 'src/components/core/Hidden';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import LinearProgress from 'src/components/LinearProgress';
import TableCell from 'src/components/TableCell/TableCell_CMR';
import TableRow from 'src/components/TableRow/TableRow_CMR';
import { formatDate } from 'src/utilities/formatDate';
import ActionMenu, { Handlers } from './ImagesActionMenu';

const useStyles = makeStyles((theme: Theme) => ({
  label: {
    width: '30%',
    [theme.breakpoints.down('sm')]: {
      width: '45%'
    },
    [theme.breakpoints.down('xs')]: {
      width: '65%'
    }
  },
  size: {
    [theme.breakpoints.down('sm')]: {
      width: '15%'
    },
    [theme.breakpoints.down('xs')]: {
      width: '20%'
    }
  },
  loadingStatus: {
    marginBottom: theme.spacing() / 2
  },
  actionMenu: {
    display: 'flex',
    justifyContent: 'flex-end'
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
      <TableCell className={classes.label} data-qa-image-label>
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
      <TableCell className={classes.label} data-qa-image-label>
        {label}
      </TableCell>
      <Hidden xsDown>
        <TableCell data-qa-image-date>{formatDate(created)}</TableCell>
        <TableCell data-qa-image-date>
          {expiry ? formatDate(expiry) : 'Never'}
        </TableCell>
      </Hidden>
      <TableCell className={classes.size} data-qa-image-size>
        {size} MB
      </TableCell>
      <TableCell className={classes.actionMenu}>
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

export default React.memo(ImageRow);
