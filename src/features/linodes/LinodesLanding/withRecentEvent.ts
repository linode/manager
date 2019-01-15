import { connect } from 'react-redux';
import recentEventForLinode from 'src/store/selectors/recentEventForLinode';
import { MapState } from 'src/store/types';

export interface WithRecentEvent {
  recentEvent?: Linode.Event;
}

const mapStateToProps: MapState<WithRecentEvent, { linode: { id: number } }>
  = (state, props) => ({
    recentEvent: recentEventForLinode(props.linode.id)(state)
  });

export default connect(mapStateToProps);
