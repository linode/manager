import { Event } from '@linode/api-v4/lib/account/types';
import classNames from 'classnames';
import { Duration } from 'luxon';
import * as React from 'react';
import BarPercent from 'src/components/BarPercent';
import Box from 'src/components/core/Box';
import Divider from 'src/components/core/Divider';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import Typography from 'src/components/core/Typography';
import {
  eventLabelGenerator,
  eventMessageGenerator,
} from 'src/eventMessageGenerator_CMR';
import { GravatarByUsername } from 'src/components/GravatarByUsername';
import useLinodes from 'src/hooks/useLinodes';
import { useSpecificTypes } from 'src/queries/types';
import { useStyles as useEventStyles } from './RenderEvent';
import { extendTypesQueryResult } from 'src/utilities/extendType';
import { isNotNullOrUndefined } from 'src/utilities/nullOrUndefined';

const useStyles = makeStyles((theme: Theme) => ({
  bar: {
    marginTop: theme.spacing(),
  },
}));

interface Props {
  event: Event;
  onClose: () => void;
}

export type CombinedProps = Props;

export const RenderProgressEvent: React.FC<Props> = (props) => {
  const { event } = props;
  const eventClasses = useEventStyles();
  const classes = useStyles();

  const { linodes } = useLinodes();
  const _linodes = Object.values(linodes.itemsById);
  const typesQuery = useSpecificTypes(
    _linodes.map((linode) => linode.type).filter(isNotNullOrUndefined)
  );
  const types = extendTypesQueryResult(typesQuery);
  const message = eventMessageGenerator(event, _linodes, types);

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
          [eventClasses.root]: true,
          [eventClasses.event]: true,
        })}
        display="flex"
        data-test-id={event.action}
      >
        <GravatarByUsername
          username={event.username}
          className={eventClasses.icon}
        />
        <div className={eventClasses.eventMessage} data-test-id={event.action}>
          {eventMessage}
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
