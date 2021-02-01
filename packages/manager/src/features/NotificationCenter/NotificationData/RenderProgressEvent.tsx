import { Event } from '@linode/api-v4/lib/account/types';
import { Duration } from 'luxon';
import * as React from 'react';
import BarPercent from 'src/components/BarPercent';
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
import EntityIcon, { Variant } from 'src/components/EntityIcon';
import Divider from 'src/components/core/Divider';

const useStyles = makeStyles((theme: Theme) => ({
  action: {
    display: 'flex',
    flexFlow: 'row nowrap'
  },
  bar: {
    marginTop: theme.spacing()
  },
  icon: {
    marginTop: -2,
    marginRight: theme.spacing(2),
    '& svg': {
      height: 20,
      width: 20
    }
  },
  message: {
    width: '100%'
  }
}));

interface Props {
  event: Event;
}

export type CombinedProps = Props;

export const RenderProgressEvent: React.FC<Props> = props => {
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

  const parsedTimeRemaining = formatTimeRemaining(event.time_remaining);

  const formattedTimeRemaining = parsedTimeRemaining
    ? ` (~${parsedTimeRemaining})`
    : null;

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

  const type = event.entity?.type ?? 'linode';

  return (
    <>
      <div className={classes.action}>
        <EntityIcon
          className={classes.icon}
          variant={type as Variant}
          status="busy"
        />
        <div className={classes.message}>
          <Typography>
            {label}
            {` `}
            {message}
            {formattedTimeRemaining}
          </Typography>
          <BarPercent
            className={classes.bar}
            max={100}
            value={event.percent_complete ?? 0}
            rounded
            narrow
          />
        </div>
      </div>
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

export default React.memo(RenderProgressEvent);
