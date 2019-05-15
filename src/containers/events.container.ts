import { connect } from 'react-redux';
import { ApplicationState } from 'src/store';

export interface EventsProps {
  eventsData: Linode.Event[];
}

export default <TInner extends {}, TOuter extends {}>(
  mapEventsToProps: (ownProps: TOuter, eventsData: Linode.Event[]) => TInner
) =>
  connect((state: ApplicationState, ownProps: TOuter) => {
    const eventsData = state.events.events;

    return mapEventsToProps(ownProps, eventsData);
  });
