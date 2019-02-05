import { connect } from 'react-redux';
import { compose, lifecycle } from 'recompose';
import { getLinodeConfigs } from 'src/services/linodes';
import { MapState } from 'src/store/types';

interface OutterProps {
  linodeId: number;
  configs?: Linode.Config[];
}

export interface IncrediblyExtendedLinode extends Linode.Linode {
  _type?: null | Linode.LinodeType;
  _configs: Linode.Config[];
  _notifications: Linode.Notification[];
  _events: Linode.Event[];
}

export interface InnerProps {
  loading: boolean;
  error?: Linode.ApiFieldError[];
  linode?: IncrediblyExtendedLinode;
}

const isLoading = (state: { loading: boolean; lastUpdated: number }) =>
  state.lastUpdated === 0 && state.loading;

/** Get the Linode from Redux. */
const mapState: MapState<InnerProps, OutterProps> = (state, ownProps) => {
  const { linodeId, configs = [] } = ownProps;
  const { entities: linodes, error: linodesError } = state.__resources.linodes;
  const { entities: types, error: typesError } = state.__resources.types;
  const { data: notifications = [] } = state.__resources.notifications;
  const { events } = state.events;

  const linode = linodes.find(l => l.id === linodeId);

  const loading =
    isLoading(state.__resources.linodes) || isLoading(state.__resources.types);

  const error = linodesError || typesError;

  if (error) {
    return { loading: false, error };
  }

  if (loading) {
    return { loading: true };
  }

  if (!linode) {
    return { loading: false, linode };
  }

  const _type =
    linode.type === null ? null : types.find(t => t.id === linode.type);

  const _events = events.filter(
    ({ entity }) =>
      entity && entity.type === 'linode' && entity.id === linode.id
  );
  const _notifications = notifications.filter(
    ({ entity }) =>
      entity && entity.type === 'linode' && entity.id === linode.id
  );

  return {
    loading,
    error: linodesError || typesError,
    linode: {
      ...linode,
      _type,
      _events,
      _configs: configs,
      _notifications
    }
  };
};

const withLinode = connect(mapState);

/** Gets the configs for the Linode on mount and on update when the linode ID has change. */
const getConfigsForLinode = lifecycle<
  OutterProps,
  { configs: Linode.Config[] }
>({
  componentDidMount() {
    const { linodeId } = this.props;
    getLinodeConfigs(linodeId)
      .then(({ data }) => this.setState({ configs: data }))
      .catch(err => undefined);
  },
  componentDidUpdate(prevProps) {
    const { linodeId } = this.props;
    const { linodeId: prevLinodeId } = prevProps;
    if (linodeId !== prevLinodeId) {
      getLinodeConfigs(linodeId)
        .then(({ data }) => this.setState({ configs: data }))
        .catch(err => undefined);
    }
  }
});

/**
 * Hi, my name is LinodesDetail.container. My lifes puporse is to create a very comprehensive
 * Linode object, including all of the sub-parts, and tell you where I am in the process. This
 * includes an error and loading state as well. :yay:
 *
 * Since we're not storing Linode advanced configurations anywhere, I'll go get them for you any
 * time I mount, or if the linodeId provided to me changes. Then I'll go get the Linode from the
 * Redux store. If the Linode is still loading, an error has occured, or I can't find the Linode
 * in the store, Ill let you know about that as well.
 *
 * Then, because I heart you, I'm going to try to find detailed information on your plan type,
 * events, and notifications. Heck I can get more from the store if you want! Then Im going to
 * take that information, and the configs I already have, and attach them to underscored property
 * names on the Linode object. I chose an underscore to let you know they werent native to the
 * API.
 *
 * Welp. thats all for me. Hope I dont crash!
 *
 * :teehee:
 */
export default compose<InnerProps, OutterProps>(
  getConfigsForLinode,
  withLinode
);
