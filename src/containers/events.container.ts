import { connect } from 'react-redux';

export interface EventsProps {
  eventsData: Linode.Event[];
}

export default <TInner extends {}, TOutter extends {}>(
  mapEventsToProps: (ownProps: TOutter, eventsData: Linode.Event[]) => TInner,
) => connect((state: ApplicationState, ownProps: TOutter) => {
  const eventsData = state.events.events;

  return mapEventsToProps(ownProps, eventsData);
});