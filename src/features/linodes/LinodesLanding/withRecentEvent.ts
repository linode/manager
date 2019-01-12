import { connect } from 'react-redux';
import recentEventForLinode from 'src/store/selectors/recentEventForLinode';
import { MapState } from 'src/store/types';

export interface WithRecentEvent {
  recentEvent?: Linode.Event;
}

const mapStateToProps: MapState<WithRecentEvent, { linodeId: number }>
  = (state, props) => ({
    recentEvent: recentEventForLinode(props.linodeId)(state)
  });

export default connect(mapStateToProps);
