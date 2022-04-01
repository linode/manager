import { Event } from '@linode/api-v4/lib/account/types';
import classNames from 'classnames';
import { Duration } from 'luxon';
import * as React from 'react';
import BarPercent from 'src/components/BarPercent';
import Box from 'src/components/core/Box';
import Divider from 'src/components/core/Divider';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { Link } from 'src/components/Link';
import {
  eventLabelGenerator,
  eventMessageGenerator,
} from 'src/eventMessageGenerator_CMR';
import GravatarIcon from 'src/features/Profile/DisplaySettings/GravatarIcon';
import useLinodes from 'src/hooks/useLinodes';
import { useTypes } from 'src/hooks/useTypes';
import useEventInfo from './useEventInfo';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    width: '100%',
  },
  event: {
    color: theme.textColors.headlineStatic,
    '&:hover': {
      backgroundColor: theme.bg.app,
      cursor: 'pointer',
      // Extends the hover state to the edges of the drawer
      marginLeft: -20,
      marginRight: -20,
      paddingLeft: 20,
      paddingRight: 20,
      width: 'calc(100% + 40px)',
      '& a': {
        textDecoration: 'none',
      },
    },
  },
  bar: {
    marginTop: theme.spacing(),
  },
  icon: {
    height: 40,
    minWidth: 40,
    marginRight: 20,
  },
  eventMessage: {
    marginTop: 2,
  },
}));

interface Props {
  event: Event;
  onClose: () => void;
}

export type CombinedProps = Props;

export const RenderProgressEvent: React.FC<Props> = (props) => {
  const { event, onClose } = props;
  const classes = useStyles();

  const { linodes } = useLinodes();
  const { types } = useTypes();
  const _linodes = Object.values(linodes.itemsById);
  const _types = types.entities;
  const { linkTarget } = useEventInfo(event);
  const message = eventMessageGenerator(event, _linodes, _types);

  if (message === null) {
    return null;
  }

  const parsedTimeRemaining = formatTimeRemaining(event.time_remaining);

  const formattedTimeRemaining = parsedTimeRemaining
    ? ` (~${parsedTimeRemaining})`
    : null;

  const eventMessage = (
    <Typography>
      {event.action !== 'volume_migrate' ? eventLabelGenerator(event) : ''}
      {` `}
      {message}
      {formattedTimeRemaining}
    </Typography>
  );

  return (
    <>
      <Box
        className={classNames({
          [classes.root]: true,
          [classes.event]: !!linkTarget,
        })}
        display="flex"
        data-test-id={event.action}
      >
        <GravatarIcon username={event.username} className={classes.icon} />
        <div className={classes.eventMessage} data-test-id={event.action}>
          {linkTarget ? (
            <Link to={linkTarget} onClick={onClose}>
              {eventMessage}
            </Link>
          ) : (
            eventMessage
          )}
          <BarPercent
            className={classes.bar}
            max={100}
            value={event.percent_complete ?? 0}
            rounded
            narrow
          />
        </div>
      </Box>
      <Divider className={classes.bar} />
    </>
  );
};

export const formatTimeRemaining = (time: string | null) => {
  if (!time) {
    return null;
  }

  try {
    const [hours, minutes, seconds] = time.split(':').map(Number);
    if (
      [hours, minutes, seconds].some(
        (thisNumber) => typeof thisNumber === 'undefined'
      ) ||
      [hours, minutes, seconds].some(isNaN)
    ) {
      // Bad input, don't display a duration
      return null;
    }
    const duration = Duration.fromObject({ hours, minutes, seconds });
    return hours > 0
      ? `${Math.round(duration.as('hours'))} hours remaining`
      : `${Math.round(duration.as('minutes'))} minutes remaining`;
  } catch {
    // Broken/unexpected input
    return null;
  }
};

export default React.memo(RenderProgressEvent);
