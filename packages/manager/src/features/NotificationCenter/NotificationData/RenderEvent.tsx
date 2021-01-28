import { Event } from '@linode/api-v4/lib/account/types';
import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { Link } from 'src/components/Link';
import eventMessageGenerator from 'src/eventMessageGenerator';
import createLinkHandlerForNotification from 'src/utilities/getEventsActionLinkStrings';
import { formatEventSeconds } from 'src/utilities/minute-conversion/minute-conversion';
import { formatEventWithUsername } from 'src/features/Events/Event.helpers';
import EntityIcon, { Variant } from 'src/components/EntityIcon';

const useStyles = makeStyles((theme: Theme) => ({
  action: {
    display: 'flex',
    flexFlow: 'row nowrap',
    justifyContent: 'flex-start',
    alignItems: 'center',
    '&:hover': {
      textDecorationColor: theme.palette.text.primary
    }
  },
  icon: {
    marginRight: theme.spacing()
  }
}));

interface Props {
  event: Event;
}

export type CombinedProps = Props;

export const RenderEvent: React.FC<Props> = props => {
  const { event } = props;
  const classes = useStyles();

  const message = eventMessageGenerator(event);
  const messageWithUsername = formatEventWithUsername(
    event.action,
    event.username,
    message
  );

  if (message === null) {
    return null;
  }

  const type = event.entity?.type ?? 'linode';

  const duration = formatEventSeconds(event.duration);

  const linkTarget = createLinkHandlerForNotification(
    event.action,
    event.entity,
    false
  );

  const content = (
    <>
      <EntityIcon
        className={classes.icon}
        variant={type as Variant}
        status={status}
        size={25}
      />
      <Typography>
        {messageWithUsername}
        {event.duration
          ? event.status === 'failed'
            ? ` (failed after ${duration})`
            : ` (completed in ${duration})`
          : null}
      </Typography>
    </>
  );

  return linkTarget ? (
    <Link to={linkTarget} className={classes.action}>
      {content}
    </Link>
  ) : (
    <div className={classes.action}>{content}</div>
  );
};

export default React.memo(RenderEvent);
