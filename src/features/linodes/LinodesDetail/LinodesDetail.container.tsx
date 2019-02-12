import * as React from 'react';
import { connect } from 'react-redux';
import {
  branch,
  compose,
  lifecycle,
  mapProps,
  renderComponent,
  withProps
} from 'recompose';
import CircleProgress from 'src/components/CircleProgress';
import ErrorState from 'src/components/ErrorState';
import NotFound from 'src/components/NotFound';
import { getLinodeConfigs, getLinodeDisks } from 'src/services/linodes';
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

interface LinodeConfigsState {
  configsLoading: boolean;
  configsError: Linode.ApiFieldError[];
  configsData: Linode.Config[];
}

const withLinodeConfigsState = lifecycle<
  { linodeId: number },
  LinodeConfigsState
>({
  componentDidMount() {
    const { linodeId } = this.props;

    this.setState({ configsData: [], configsLoading: true });

    getLinodeConfigs(linodeId)
      .then(({ data }) =>
        this.setState({ configsLoading: false, configsData: data })
      )
      .catch(err =>
        this.setState({ configsLoading: false, configsError: err })
      );
  },

  componentDidUpdate(prevProps) {
    const { linodeId } = prevProps;
    const { linodeId: prevLinodeId } = this.props;
    if (linodeId === prevLinodeId) {
      return;
    }
    this.setState({ configsData: [], configsLoading: true });

    getLinodeConfigs(linodeId)
      .then(({ data }) =>
        this.setState({ configsLoading: false, configsData: data })
      )
      .catch(err =>
        this.setState({ configsLoading: false, configsError: err })
      );
  }
});

interface LinodeDisksState {
  disksLoading: boolean;
  disksError: Linode.ApiFieldError[];
  disksData: Linode.Disk[];
}

const withLinodeDisksState = lifecycle<{ linodeId: number }, LinodeDisksState>({
  componentDidMount() {
    const { linodeId } = this.props;

    this.setState({ disksData: [], disksLoading: true });

    getLinodeDisks(linodeId)
      .then(({ data }) =>
        this.setState({ disksLoading: false, disksData: data })
      )
      .catch(err => this.setState({ disksLoading: false, disksError: err }));
  },

  componentDidUpdate(prevProps) {
    const { linodeId } = prevProps;
    const { linodeId: prevLinodeId } = this.props;
    if (linodeId === prevLinodeId) {
      return;
    }

    this.setState({ disksData: [], disksLoading: true });

    getLinodeDisks(linodeId)
      .then(({ data }) =>
        this.setState({ disksLoading: false, disksData: data })
      )
      .catch(err => this.setState({ disksLoading: false, disksError: err }));
  }
});

/**
 * Get Linode, type, events, notifications, and volumes from Redux store and mash them onto
 * the Linode object.
 *
 * @todo Test.
 * @todo Use reselect!
 * @todo We could break this into individual selectors (linode, events, type, notifications, and volumes),
 * then use Recompose's mapProps to merge them together?
 */
export default compose<InnerProps, OutterProps>(
  withProps(props => ({
    configsLoading: true,
    configsData: [],
    configsError: undefined
  })),

  withProps(props => ({
    disksLoading: true,
    disksData: [],
    disksError: undefined
  })),

  withLinodeConfigsState,

  withLinodeDisksState,

  withLinode,

  /** Merge loading. */
  mapProps<
    { loading: boolean },
    { loading: boolean; configsLoading: boolean; disksLoading: boolean }
  >(({ loading, configsLoading, disksLoading, ...rest }) => ({
    ...rest,
    loading: loading || configsLoading || disksLoading
  })),

  /** Merge errors. */
  mapProps<
    { error?: Linode.ApiFieldError[] },
    {
      error?: Linode.ApiFieldError[];
      configsError?: Linode.ApiFieldError[];
      disksError?: Linode.ApiFieldError[];
    }
  >(({ error, configsError, disksError, ...rest }) => ({
    ...rest,
    error: error || configsError || disksError
  })),

  /** Merge configs and disks onto Linode */
  compose(
    branch(({ loading }) => loading, renderComponent(() => <CircleProgress />)),
    branch(
      ({ error }) => Boolean(error),
      renderComponent(() => <ErrorState errorText="Unable to load Linodes" />)
    ),
    branch(
      ({ linode }) => linode === undefined,
      renderComponent(() => <NotFound />)
    )
  ),

  mapProps<
    {
      linode: Linode.Linode & { _disks: Linode.Disk[] } & {
        _configs: Linode.Config[];
      };
    },
    {
      linode: Linode.Linode;
      configsData: Linode.Config[];
      disksData: Linode.Disk[];
    }
  >(ownProps => {
    const { linode, configsData, disksData, ...rest } = ownProps;

    return {
      ...rest,
      linode: { ...linode, _configs: configsData, _disks: disksData }
    };
  })
);
