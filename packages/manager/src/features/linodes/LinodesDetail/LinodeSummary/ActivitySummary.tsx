import { Event } from 'linode-js-sdk/lib/account';
import * as React from 'react';
import Grid from 'src/components/core/Grid';
import Paper from 'src/components/core/Paper';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import ViewAllLink from 'src/components/ViewAllLink';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';
import { getEventsForEntity } from 'src/utilities/getEventsForEntity';
import ActivitySummaryContent from './ActivitySummaryContent';

import {
  filterUniqueEvents,
  shouldUpdateEvents
} from 'src/features/Events/Event.helpers';
import { ExtendedEvent } from 'src/store/events/event.types';
import { removeBlacklistedEvents } from 'src/utilities/eventUtils';

type ClassNames = 'root' | 'header' | 'viewMore';

const styles = (theme: Theme) =>
  createStyles({
    root: {},
    header: {
      marginTop: theme.spacing(3),
      marginBottom: theme.spacing(1)
    },
    viewMore: {
      position: 'relative',
      top: 2
    }
  });

interface Props {
  linodeId: number;
  inProgressEvents: Record<number, number>;
  eventsFromRedux: ExtendedEvent[];
  mostRecentEventTime: string;
}

interface State {
  loading: boolean;
  error?: string;
  events: Event[];
}

type CombinedProps = Props & WithStyles<ClassNames>;

export class ActivitySummary extends React.Component<CombinedProps, State> {
  state: State = {
    loading: true,
    error: undefined,
    events: []
  };

  componentDidUpdate(prevProps: CombinedProps) {
    /**
     * This condition checks either the most recent event time has changed OR
     * if the in progress events have changed or that the in-progress events have new percentages
     *
     * This is necessary because we have 2 types of events: ones that have percent and ones that
     * don't.
     *
     * Events that don't have a percentage won't affect the inProgressEvents state, which is why
     * we're checking the mostRecentEvent time becasue that will update when we get a new event
     *
     * That being said, mostRecentEventTime will NOT be updated when a event's percentage updates
     */
    if (
      shouldUpdateEvents(
        {
          mostRecentEventTime: prevProps.mostRecentEventTime,
          inProgressEvents: prevProps.inProgressEvents
        },
        {
          mostRecentEventTime: this.props.mostRecentEventTime,
          inProgressEvents: this.props.inProgressEvents
        }
      )
    ) {
      this.setState({
        events: filterUniqueEvents([
          /*
            make sure that we're popping new related events to the top
            of the activity stream. Make sure they're events after the ones
            we got from page load and ones that match the Linode ID
          */
          ...this.props.eventsFromRedux.filter(eachEvent => {
            return (
              /** all events from Redux will have this flag as a boolean value */
              !eachEvent._initial &&
              (eachEvent.entity &&
                eachEvent.entity.id === this.props.linodeId &&
                eachEvent.entity.type === 'linode')
            );
          }),
          /*
            at this point, the state is populated with events from the cDM
            request (which don't include the "_initial flag"), but it might also
            contain events from Redux as well. We only want the ones where the "_initial"
            flag doesn't exist
          */
          ...this.state.events.filter(
            eachEvent => typeof eachEvent._initial === 'undefined'
          )
        ])
      });
    }
  }

  componentDidMount() {
    getEventsForEntity({}, 'linode', this.props.linodeId)
      .then(response => {
        this.setState({
          events: response.data,
          loading: false
        });
      })
      .catch(err => {
        this.setState({
          error: getErrorStringOrDefault(
            err,
            "Couldn't retrieve events for this Linode."
          ),
          loading: false
        });
      });
  }
  render() {
    const { classes, linodeId } = this.props;
    const { events, error, loading } = this.state;

    const filteredEvents = removeBlacklistedEvents(events);

    return (
      <>
        <Grid container alignItems={'center'} className={classes.header}>
          <Grid item>
            <Typography variant="h2">Activity Feed</Typography>
          </Grid>
          <Grid item>
            <Typography>
              <ViewAllLink
                text="View More Activity"
                link={`/linodes/${linodeId}/activity`}
                className={classes.viewMore}
              />
            </Typography>
          </Grid>
        </Grid>
        <Paper className={classes.root}>
          <ActivitySummaryContent
            events={filteredEvents.slice(0, 5)}
            error={error}
            loading={loading}
          />
        </Paper>
      </>
    );
  }
}

const styled = withStyles(styles);

export default styled(ActivitySummary);
