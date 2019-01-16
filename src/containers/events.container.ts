import { connect } from 'react-redux';

export interface EventsProps {
  eventsData: Linode.Event[];
}

export default <TInner extends {}, TOutter extends {}>(
  mapVolumesToProps: (ownProps: TOutter, eventsData: Linode.Event[]) => TInner,
) => connect((state: ApplicationState, ownProps: TOutter) => {
  const eventsData = state.events.events;

  return mapVolumesToProps(ownProps, eventsData);
});