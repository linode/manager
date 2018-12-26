import { connect, MapStateToProps } from 'react-redux';
import recentEventForLinode from 'src/store/selectors/recentEventForLinode';

export interface WithRecentEvent {
  recentEvent?: Linode.Event;
}

const mapStateToProps: MapStateToProps<WithRecentEvent, { linodeId: number }, ApplicationState>
  = (state, props) => ({
    recentEvent: recentEventForLinode(props.linodeId)(state)
  });

export default connect(mapStateToProps);
