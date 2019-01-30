import { Location } from 'history';
import * as moment from 'moment';
import { InjectedNotistackProps, withSnackbar } from 'notistack';
import { compose, Lens, lensPath, pathEq, pathOr, set } from 'ramda';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import 'rxjs/add/observable/timer';
import 'rxjs/add/operator/debounce';
import 'rxjs/add/operator/filter';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import CircleProgress from 'src/components/CircleProgress';
import ErrorState from 'src/components/ErrorState';
import NotFound from 'src/components/NotFound';
import { events$ } from 'src/events';
import { reportException } from 'src/exceptionReporting';
import LinodeConfigSelectionDrawer from 'src/features/LinodeConfigSelectionDrawer';
import { newLinodeEvents } from 'src/features/linodes/events';
import { Requestable } from 'src/requestableContext';
import {
  getLinode,
  getLinodeConfigs,
  getType,
  startMutation
} from 'src/services/linodes';
import { _getLinodeDisks } from 'src/store/linodeDetail/disks';
import { _getLinodeVolumes } from 'src/store/linodeDetail/volumes';
import {
  LinodeActionsProps,
  withLinodeActions
} from 'src/store/linodes/linode.containers';
import { ThunkDispatch } from 'src/store/types';
import haveAnyBeenModified from 'src/utilities/haveAnyBeenModified';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import { ConfigsProvider, LinodeProvider } from './context';
import LinodeDetailErrorBoundary from './LinodeDetailErrorBoundary';
import LinodesDetailHeader from './LinodesDetailHeader';
import MutateDrawer from './MutateDrawer';
import reloadableWithRouter from './reloadableWithRouter';

interface ConfigDrawerState {
  open: boolean;
  configs: Linode.Config[];
  error?: string;
  selected?: number;
  action?: (id: number) => void;
}

interface MutateInfo {
  vcpus: number | null;
  memory: number | null;
  disk: number | null;
  transfer: number | null;
  network_out: number | null;
}

interface MutateDrawer {
  open: boolean;
  loading: boolean;
  error: string;
}

interface State {
  context: {
    configs: Requestable<Linode.Config[]>;
    linode: Requestable<Linode.Linode>;
  };
  configDrawer: ConfigDrawerState;
  labelInput: { label: string; errorText: string };
  showPendingMutation: boolean;
  mutateInfo: MutateInfo | null;
  mutateDrawer: MutateDrawer;
  currentNetworkOut: number | null;
}

interface MatchProps {
  linodeId?: string;
}

type RouteProps = RouteComponentProps<MatchProps>;

type CombinedProps = LinodeActionsProps &
  DispatchProps &
  RouteProps &
  InjectedNotistackProps;

const labelInputLens = lensPath(['labelInput']);
const configsLens = lensPath(['context', 'configs']);
const linodeLens = lensPath(['context', 'linode']);

const L = {
  configs: {
    configs: configsLens,
    data: compose(
      configsLens,
      lensPath(['data'])
    ) as Lens,
    errors: compose(
      configsLens,
      lensPath(['errors'])
    ) as Lens,
    lastUpdated: compose(
      configsLens,
      lensPath(['lastUpdated'])
    ) as Lens,
    loading: compose(
      configsLens,
      lensPath(['loading'])
    ) as Lens
  },
  labelInput: {
    errorText: compose(
      labelInputLens,
      lensPath(['errorText'])
    ) as Lens,
    label: compose(
      labelInputLens,
      lensPath(['label'])
    ) as Lens,
    labelInput: labelInputLens
  },
  linode: {
    data: compose(
      linodeLens,
      lensPath(['data'])
    ) as Lens,
    errors: compose(
      linodeLens,
      lensPath(['errors'])
    ) as Lens,
    lastUpdated: compose(
      linodeLens,
      lensPath(['lastUpdated'])
    ) as Lens,
    linode: linodeLens,
    loading: compose(
      linodeLens,
      lensPath(['loading'])
    ) as Lens
  }
};

type StateSetter = <S>(v: S) => S;

class LinodeDetail extends React.Component<CombinedProps, State> {
  eventsSubscription: Subscription;

  volumeEventsSubscription: Subscription;

  diskResizeSubscription: Subscription;

  mounted: boolean = false;

  state: State = {
    configDrawer: {
      action: (id: number) => null,
      configs: [],
      error: undefined,
      open: false,
      selected: undefined
    },
    context: {
      configs: {
        lastUpdated: 0,
        loading: true,
        request: () => {
          this.setState(set(L.configs.loading, true));

          return getLinodeConfigs(+this.props.match.params.linodeId!)
            .then(({ data }) => {
              this.composeState(
                set(L.configs.loading, false),
                set(L.configs.data, data),
                set(L.configs.lastUpdated, Date.now())
              );
              return data;
            })
            .catch(r => {
              this.composeState(
                set(L.configs.lastUpdated, Date.now()),
                set(L.configs.loading, false),
                set(L.configs.errors, r)
              );
            });
        },
        update: updater => {
          const { data: configs } = this.state.context.configs;
          if (!configs) {
            return;
          }

          this.composeState(set(L.configs.data, updater(configs)));
        }
      },
      linode: {
        lastUpdated: 0,
        loading: true,
        request: (recentEvent?: Linode.Event) => {
          this.setState(set(L.linode.loading, true));

          return getLinode(+this.props.match.params.linodeId!)
            .then(({ data }) => {
              this.composeState(
                set(L.labelInput.label, data.label),
                set(L.linode.loading, false),
                set(L.linode.data, { ...data, recentEvent }),
                set(L.linode.lastUpdated, Date.now())
              );
              return data;
            })
            .catch(r => {
              this.composeState(
                set(L.linode.lastUpdated, Date.now()),
                set(L.linode.loading, false),
                set(L.linode.errors, r)
              );
            });
        },
        update: updater => {
          const { data: linode } = this.state.context.linode;
          if (!linode) {
            return;
          }

          const updatedLinode = updater(linode);

          this.composeState(
            set(L.linode.data, updatedLinode),
            set(L.labelInput.label, updatedLinode.label)
          );
        }
      }
    },
    labelInput: {
      label: '',
      errorText: ''
    },
    showPendingMutation: false,
    mutateInfo: null,
    mutateDrawer: {
      open: false,
      loading: false,
      error: ''
    },
    currentNetworkOut: null
  };

  composeState = (...fns: StateSetter[]) =>
    this.setState(state =>
      fns.reverse().reduce((result, current) => current(result), state)
    );

  shouldComponentUpdate(nextProps: CombinedProps, nextState: State) {
    const { location } = this.props;
    const { location: nextLocation } = nextProps;

    return (
      haveAnyBeenModified<State>(this.state, nextState, [
        'context',
        'configDrawer',
        'labelInput',
        'mutateDrawer',
        'showPendingMutation'
      ]) ||
      haveAnyBeenModified<Location>(location, nextLocation, [
        'pathname',
        'search'
      ])
    );
  }

  componentWillUnmount() {
    this.mounted = false;
    this.eventsSubscription.unsubscribe();
    this.volumeEventsSubscription.unsubscribe();
  }

  componentDidUpdate(prevProps: CombinedProps, prevState: State) {
    const {
      context: {
        linode: { data: linode }
      }
    } = this.state;

    /*
     * /linodes/instances/types/type has a "successor" property
     * that will have a non-null value if this Linode has an upgrade
     * available
     */
    if (!!linode && prevState.context.linode.data !== linode && linode.type) {
      getType(linode.type)
        .then((currentType: Linode.LinodeType) => {
          const typeIsDeprecated = currentType.successor !== null;
          /*
           * Now that we know the type is deprecated, get the successor's new
           * specs so we can show the user what exactly is getting upgraded
           */
          if (!!currentType.successor && typeIsDeprecated) {
            getType(currentType.successor!)
              .then((successorData: Linode.LinodeType) => {
                // finally show the notice to the user with the upgrade info
                this.setState({
                  showPendingMutation: true,
                  currentNetworkOut: currentType.network_out,
                  // data is only relevant if the upgrade data is different from the current type's data
                  mutateInfo: {
                    vcpus:
                      successorData.vcpus !== currentType.vcpus
                        ? successorData.vcpus
                        : null,
                    network_out:
                      successorData.network_out !== currentType.network_out
                        ? successorData.network_out
                        : null,
                    disk:
                      successorData.disk !== currentType.disk
                        ? successorData.disk
                        : null,
                    transfer:
                      successorData.transfer !== currentType.transfer
                        ? successorData.transfer
                        : null,
                    memory:
                      successorData.memory !== currentType.memory
                        ? successorData.memory
                        : null
                  }
                });
              })
              // no action needed. Worse case scenario, the user doesn't
              // see the notice
              .catch((e: Error) => e);
          } else {
            // type is not deprecated
            this.setState({ showPendingMutation: false });
          }
        })
        // no action needed. Worse case scenario, the user doesn't
        // see the notice
        .catch((e: Error) => e);
    }
  }

  componentDidMount() {
    this.mounted = true;

    const {
      context: { configs, linode }
    } = this.state;
    const mountTime = moment().subtract(5, 'seconds');
    const {
      actions,
      match: {
        params: { linodeId }
      }
    } = this.props;

    this.diskResizeSubscription = events$
      .filter(e => !e._initial)
      .filter(pathEq(['entity', 'id'], Number(linodeId)))
      .filter(e => e.status === 'finished' && e.action === 'disk_resize')
      .subscribe(e => actions.getLinodeDisks());

    this.eventsSubscription = events$
      .filter(pathEq(['entity', 'id'], Number(linodeId)))
      .filter(newLinodeEvents(mountTime))
      .debounce(() => Observable.timer(1000))
      .subscribe(linodeEvent => {
        configs.request();
        actions.getLinodeDisks();
        actions.getLinodeVolumes();
        linode.request(linodeEvent);
      });

    /** Get events which are related to volumes and this Linode */
    this.volumeEventsSubscription = events$
      .filter(e =>
        [
          'volume_attach',
          'volume_clone',
          'volume_create',
          'volume_delete',
          'volume_detach',
          'volume_resize'
        ].includes(e.action)
      )
      .filter(e => !e._initial)
      .subscribe(v => {
        actions.getLinodeVolumes();
      });

    configs.request();
    actions.getLinodeVolumes();
    linode.request();
  }

  openConfigDrawer = (
    configs: Linode.Config[],
    action: (id: number) => void
  ) => {
    this.setState({
      configDrawer: {
        action,
        configs,
        open: true,
        selected: configs[0].id
      }
    });
  };

  closeConfigDrawer = () => {
    this.setState({
      configDrawer: {
        action: (id: number) => null,
        configs: [],
        error: undefined,
        open: false,
        selected: undefined
      }
    });
  };

  selectConfig = (id: number) => {
    this.setState(prevState => ({
      configDrawer: {
        ...prevState.configDrawer,
        selected: id
      }
    }));
  };

  submitConfigChoice = () => {
    const { action, selected } = this.state.configDrawer;
    if (selected && action) {
      action(selected);
      this.closeConfigDrawer();
    }
  };

  // @TODO add support for multiple error messages
  // (Currently, including multiple error strings
  // breaks the layout)
  updateLabel = (label: string) => {
    const {
      linodeActions: { updateLinode }
    } = this.props;
    const { data: linode } = this.state.context.linode;
    /** "!" is okay because linode being undefined is being handled by render() */
    return updateLinode({ linodeId: linode!.id, label })
      .then(linodeResponse => {
        this.composeState(
          set(L.linode.data, linodeResponse),
          set(L.labelInput.label, linodeResponse.label),
          set(L.labelInput.errorText, undefined)
        );
      })
      .catch(err => {
        const errors: Linode.ApiFieldError[] = pathOr(
          [],
          ['response', 'data', 'errors'],
          err
        );
        const errorStrings: string[] = errors.map(e => e.reason);
        /** "!" is okay because linode being undefined is being handled by render() */
        this.setState(
          { labelInput: { label: linode!.label, errorText: errorStrings[0] } },
          () => {
            scrollErrorIntoView();
          }
        );
        return Promise.reject(errorStrings[0]);
      });
  };

  cancelUpdate = () => {
    /** @todo figure out why this logic was here in the first place */
    // const { data: linode } = this.state.context.linode;
    // if (!linode) { return; }
    const { labelInput } = this.state;
    this.setState({ labelInput: { ...labelInput, errorText: '' } });
    // this.forceUpdate();
  };

  openMutateDrawer = () => {
    this.setState({ mutateDrawer: { ...this.state.mutateDrawer, open: true } });
  };

  closeMutateDrawer = () => {
    this.setState({
      mutateDrawer: {
        ...this.state.mutateDrawer,
        open: false,
        error: ''
      }
    });
  };

  initMutation = () => {
    const {
      mutateDrawer,
      context: { linode }
    } = this.state;

    this.setState({
      mutateDrawer: {
        ...mutateDrawer,
        loading: true,
        error: ''
      }
    });
    /*
     * It's okay to disregard the possiblity of linode
     * being undefined. The upgrade message won't appear unless
     * it's defined
     */
    startMutation(linode.data!.id)
      .then(() => {
        linode.request();
        this.setState({
          mutateDrawer: {
            ...mutateDrawer,
            open: false,
            error: '',
            loading: false
          }
        });
        this.props.enqueueSnackbar('Linode upgrade has been initiated.', {
          variant: 'info'
        });
      })
      .catch(errors => {
        this.setState({
          mutateDrawer: {
            ...mutateDrawer,
            loading: false,
            error: pathOr(
              'Mutation could not be initiated.',
              ['response', 'data', 'errors', 0, 'reason'],
              errors
            )
          }
        });
      });
  };

  render() {
    const {
      match: { url }
    } = this.props;
    const {
      labelInput,
      configDrawer,
      mutateDrawer,
      mutateInfo,
      context: {
        linode: {
          data: linode,
          lastUpdated: linodeLastUpdated,
          errors: linodeErrors
        },
        configs: { data: configs, lastUpdated: configsLastUpdated }
      }
    } = this.state;

    const initialLoad = linodeLastUpdated === 0 || configsLastUpdated === 0;

    if (initialLoad) {
      return <CircleProgress />;
    }

    if (!linode) {
      return <NotFound />;
    }

    if (linodeErrors) {
      reportException(Error('Error while loading Linode.'), linodeErrors);
      return <ErrorState errorText="Error while loading Linode." />;
    }

    if (!configs) {
      throw Error('Configs undefined on LinodeLanding.');
    }

    return (
      <React.Fragment>
        <ConfigsProvider value={this.state.context.configs}>
          <React.Fragment>
            <>
              <LinodeProvider value={this.state.context.linode}>
                <React.Fragment>
                  <LinodesDetailHeader
                    openMutateDrawer={this.openMutateDrawer}
                    showPendingMutation={this.state.showPendingMutation}
                    labelInput={{
                      label: labelInput.label,
                      errorText: labelInput.errorText,
                      onCancel: this.cancelUpdate,
                      onEdit: this.updateLabel
                    }}
                    linodeId={linode.id}
                    linodeLabel={linode.label}
                    linodeRegion={linode.region}
                    linodeStatus={linode.status}
                    linodeRecentEvent={linode.recentEvent}
                    linodeTags={linode.tags}
                    linodeConfigs={configs}
                    linodeUpdate={this.state.context.linode.request}
                    url={url}
                    history={this.props.history}
                    openConfigDrawer={this.openConfigDrawer}
                  />
                  <LinodeConfigSelectionDrawer
                    onClose={this.closeConfigDrawer}
                    onSubmit={this.submitConfigChoice}
                    onChange={this.selectConfig}
                    open={configDrawer.open}
                    configs={configDrawer.configs}
                    selected={String(configDrawer.selected)}
                    error={configDrawer.error}
                  />
                  {this.state.showPendingMutation && linode && (
                    <MutateDrawer
                      linodeId={linode.id}
                      open={mutateDrawer.open}
                      loading={mutateDrawer.loading}
                      error={mutateDrawer.error}
                      handleClose={this.closeMutateDrawer}
                      mutateInfo={mutateInfo!}
                      currentTypeInfo={{
                        vcpus: linode.specs.vcpus,
                        transfer: linode.specs.transfer,
                        disk: linode.specs.disk,
                        memory: linode.specs.memory,
                        network_out: this.state.currentNetworkOut
                      }}
                      initMutation={this.initMutation}
                    />
                  )}
                </React.Fragment>
              </LinodeProvider>
            </>
          </React.Fragment>
        </ConfigsProvider>
      </React.Fragment>
    );
  }
}

const reloadable = reloadableWithRouter<CombinedProps, MatchProps>(
  (routePropsOld, routePropsNew) => {
    return (
      routePropsOld.match.params.linodeId !==
      routePropsNew.match.params.linodeId
    );
  }
);

interface DispatchProps {
  actions: {
    getLinodeVolumes: () => void;
    getLinodeDisks: () => void;
  };
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, RouteProps> = (
  dispatch: ThunkDispatch,
  ownProps
) => {
  const {
    match: {
      params: { linodeId }
    }
  } = ownProps;

  return {
    actions: {
      getLinodeVolumes:
        typeof linodeId === 'string'
          ? () => dispatch(_getLinodeVolumes(+linodeId))
          : () => null,
      getLinodeDisks:
        typeof linodeId === 'string'
          ? () => dispatch(_getLinodeDisks(+linodeId))
          : () => null
    }
  };
};

const connected = connect(
  undefined,
  mapDispatchToProps
);

const enhanced = compose(
  connected,
  reloadable,
  LinodeDetailErrorBoundary,
  withSnackbar,
  withLinodeActions
);

export default enhanced(LinodeDetail);
