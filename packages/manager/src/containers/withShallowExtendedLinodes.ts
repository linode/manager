import { connect } from 'react-redux';
import { ApplicationState } from 'src/store';
import { shallowExtendLinodes } from 'src/store/linodes/linodes.helpers';
import { ShallowExtendedLinode } from 'src/store/linodes/types';

export interface StateProps {
  shallowExtendedLinodes: ShallowExtendedLinode[];
}

export type Props = StateProps;

export default connect((state: ApplicationState) => {
  const linodes = Object.values(state.__resources.linodes.itemsById);
  const notifications = state.__resources.notifications.data ?? [];
  const { events } = state.events;

  const shallowExtendedLinodes = shallowExtendLinodes(
    linodes,
    notifications,
    events
  );

  return {
    shallowExtendedLinodes
  };
});
