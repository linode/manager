import { Event } from '@linode/api-v4/lib/account';
import { connect } from 'react-redux';
import recentEventForLinode from 'src/store/selectors/recentEventForLinode';
import { MapState } from 'src/store/types';

export interface WithRecentEvent {
  recentEvent?: Event;
}

const mapStateToProps: MapState<WithRecentEvent, { id: number }> = (
  state,
  props
) => ({
  recentEvent: recentEventForLinode(props.id)(state),
});

export default connect(mapStateToProps);
