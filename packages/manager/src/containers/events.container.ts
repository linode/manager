import { Event } from '@linode/api-v4/lib/account';
import { connect } from 'react-redux';
import { ApplicationState } from 'src/store';

export interface EventsProps {
  eventsData: Event[];
}

export default <TInner extends {}, TOuter extends {}>(
  mapEventsToProps?: (ownProps: TOuter, eventsData: Event[]) => TInner
) =>
  connect((state: ApplicationState, ownProps: TOuter) => {
    const eventsData = state.events.events;
    if (mapEventsToProps) {
      return mapEventsToProps(ownProps, eventsData);
    }
    return { eventsData };
  });
