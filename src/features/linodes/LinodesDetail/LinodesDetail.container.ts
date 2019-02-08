import { connect } from 'react-redux';
import { compose } from 'recompose';
import { MapState } from 'src/store/types';

interface OutterProps {
  linodeId: number;
}

export interface ExtendedLinode extends Linode.Linode {
  _type?: null | Linode.LinodeType;
  _notifications: Linode.Notification[];
  _events: Linode.Event[];
  _volumes: Linode.Volume[];
}

export interface InnerProps {
  loading: boolean;
  error?: Error | Linode.ApiFieldError[];
  linode?: ExtendedLinode;
}

const isLoading = (state: { loading: boolean; lastUpdated: number }) =>
  state.lastUpdated === 0 && state.loading;

/** Get the Linode from Redux. */
const mapState: MapState<InnerProps, OutterProps> = (state, ownProps) => {
  const { linodeId } = ownProps;
  const {
    entities: linodes = [],
    error: linodesError
  } = state.__resources.linodes;

  const { entities: types = [], error: typesError } = state.__resources.types;
  const {
    itemsById: volumesById,
    error: volumesError
  } = state.__resources.volumes;

  const { data: notifications = [] } = state.__resources.notifications;
  const { events = [] } = state.events;

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

  const _volumes = Object.values(volumesById).filter(
    ({ linode_id }) => linode_id === linodeId
  );

  return {
    loading,
    error: linodesError || typesError || volumesError,
    linode: {
      ...linode,
      _type,
      _events,
      _notifications,
      _volumes
    }
  };
};

const withLinode = connect(mapState);

/**
 * Get Linode, type, events, notifications, and volumes from Redux store and mash them onto
 * the Linode object.
 *
 * @todo Test.
 * @todo Use reselect!
 * @todo We could break this into individual selectors (linode, events, type, notifications, and volumes),
 * then use Recompose's mapProps to merge them together?
 */
export default compose<InnerProps, OutterProps>(withLinode);
