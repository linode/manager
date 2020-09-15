import { Event } from '@linode/api-v4/lib/account/types';
import { Duration } from 'luxon';
import * as React from 'react';
import BarPercent from 'src/components/BarPercent/BarPercent_CMR';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { Link } from 'src/components/Link';
import {
  eventLabelGenerator,
  eventMessageGenerator
} from 'src/eventMessageGenerator_CMR';
import useLinodes from 'src/hooks/useLinodes';
import { useTypes } from 'src/hooks/useTypes';
import createLinkHandlerForNotification from 'src/utilities/getEventsActionLinkStrings';
import { formatEventSeconds } from 'src/utilities/minute-conversion/minute-conversion';

const useStyles = makeStyles((theme: Theme) => ({
  action: {
    display: 'flex',
    flexFlow: 'column nowrap'
  },
  bar: {
    marginTop: theme.spacing()
  }
}));

interface Props {
  event: Event;
}

export type CombinedProps = Props;

export const RenderEvent: React.FC<Props> = props => {
  const { event } = props;
  const classes = useStyles();

  const { linodes } = useLinodes();
  const { types } = useTypes();
  const _linodes = Object.values(linodes.itemsById);
  const _types = types.entities;

  const message = eventMessageGenerator(event, _linodes, _types);

  if (message === null) {
    return null;
  }

  const completed = event.percent_complete === 100;
  const timeRemaining = event.time_remaining
    ? ` (~${formatTimeRemaining(event.time_remaining)})`
    : null;

  const duration = formatEventSeconds(event.duration);

  const linkTarget = createLinkHandlerForNotification(
    event.action,
    event.entity,
    false
  );
  const label = linkTarget ? (
    <Link to={linkTarget}>{eventLabelGenerator(event)}</Link>
  ) : (
    event.entity?.label
  );
  return (
    <div className={classes.action}>
      <Typography>
        {label}
        {` `}
        {message}
        {/** duration and timeRemaining will never overlap, but check just in case */}
        {!completed ? timeRemaining : null}
        {completed
          ? event.status === 'failed'
            ? ` (failed after ${duration})`
            : ` (completed in ${duration})`
          : null}
      </Typography>
      {!completed ? (
        <BarPercent
          className={classes.bar}
          max={100}
          value={event.percent_complete ?? 0}
          rounded
          narrow
        />
      ) : null}
    </div>
  );
};

export const formatTimeRemaining = (time: string) => {
  try {
    const [hours, minutes, seconds] = time.split(':').map(Number);
    if (
      [hours, minutes, seconds].some(
        thisNumber => typeof thisNumber === 'undefined'
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

export default React.memo(RenderEvent);
