import * as React from 'react';
// import { Link } from 'react-router-dom';
import BarPercent from 'src/components/BarPercent/BarPercent_CMR';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import useEvents from 'src/hooks/useEvents';
import { ExtendedEvent } from 'src/store/events/event.types';
import eventMessageGenerator from 'src/eventMessageGenerator';
// import createLinkHandlerForNotification from 'src/utilities/getEventsActionLinkStrings';
import NotificationSection, { NotificationItem } from './NotificationSection';

const useStyles = makeStyles((theme: Theme) => ({
  action: {
    display: 'flex',
    flexFlow: 'column nowrap'
  },
  bar: {
    marginTop: theme.spacing()
  }
}));

export const PendingActions: React.FC<{}> = _ => {
  const classes = useStyles();
  const { inProgressEvents } = useEvents();

  const formatEventForDisplay = React.useCallback(
    (event: ExtendedEvent): NotificationItem => {
      return {
        id: `pending-action-${event.id}`,
        body: (
          <div className={classes.action}>
            <Typography>
              {eventMessageGenerator(event)}
              {event.time_remaining
                ? ` (~${event.time_remaining} remaining)`
                : null}
            </Typography>
            {event.percent_complete ? (
              <BarPercent
                className={classes.bar}
                max={100}
                value={event.percent_complete}
                rounded
                narrow
              />
            ) : null}
          </div>
        )
      };
    },
    [classes]
  );

  const actions = inProgressEvents.map(formatEventForDisplay);
  return (
    <NotificationSection
      content={actions}
      header="Pending Actions"
      showMoreTarget={'/events'}
    />
  );
};

export default React.memo(PendingActions);
