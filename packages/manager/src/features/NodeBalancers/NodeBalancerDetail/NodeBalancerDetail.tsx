import {
  getNodeBalancer,
  getNodeBalancerConfigs,
  NodeBalancer,
} from '@linode/api-v4/lib/nodebalancers';
import { APIError } from '@linode/api-v4/lib/types';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import { last, pathOr } from 'ramda';
import * as React from 'react';
import { matchPath, RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import Breadcrumb from 'src/components/Breadcrumb';
import CircleProgress from 'src/components/CircleProgress';
import TabPanels from 'src/components/core/ReachTabPanels';
import Tabs from 'src/components/core/ReachTabs';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from 'src/components/core/styles';
import setDocs from 'src/components/DocsSidebar/setDocs';
import DocsLink from 'src/components/DocsLink';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import SafeTabPanel from 'src/components/SafeTabPanel';
import TabLinkList from 'src/components/TabLinkList';
import withLoadingAndError, {
  LoadingAndErrorHandlers,
  LoadingAndErrorState,
} from 'src/components/withLoadingAndError';
import withFeatureFlagConsumerContainer, {
  FeatureFlagConsumerProps,
} from 'src/containers/withFeatureFlagConsumer.container';
import reloadableWithRouter from 'src/features/linodes/LinodesDetail/reloadableWithRouter';
import {
  withNodeBalancerActions,
  WithNodeBalancerActions,
} from 'src/store/nodeBalancer/nodeBalancer.containers';
import {
  getAPIErrorOrDefault,
  getErrorMap,
  getErrorStringOrDefault,
} from 'src/utilities/errorUtils';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import { ExtendedNodeBalancer } from '../types';
import { NodeBalancerProvider } from './context';
import NodeBalancerConfigurations from './NodeBalancerConfigurations';
import NodeBalancerSettings from './NodeBalancerSettings';
import NodeBalancerSummary from './NodeBalancerSummary';

type RouteProps = RouteComponentProps<{ nodeBalancerId?: string }>;

interface State {
  nodeBalancer?: ExtendedNodeBalancer;
  ApiError: APIError[] | undefined;
  labelInput?: string;
}

type CombinedProps = WithNodeBalancerActions &
  WithSnackbarProps &
  RouteProps &
  FeatureFlagConsumerProps &
  LoadingAndErrorHandlers &
  LoadingAndErrorState &
  WithStyles<ClassNames>;

type ClassNames = 'root';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      [theme.breakpoints.down('xs')]: {
        paddingLeft: theme.spacing(),
      },
    },
  });

class NodeBalancerDetail extends React.Component<CombinedProps, State> {
  state: State = {
    nodeBalancer: undefined,
    ApiError: undefined,
    labelInput: undefined,
  };

  pollInterval: number;

  requestNodeBalancer = (nodeBalancerId: number) =>
    Promise.all([
      getNodeBalancer(+nodeBalancerId),
      getNodeBalancerConfigs(+nodeBalancerId),
    ])
      .then(([nodeBalancer, configsData]) => {
        const { data: configs } = configsData;
        return {
          ...nodeBalancer,
          down: configs.reduce((acc: number, config) => {
            return acc + config.nodes_status.down;
          }, 0), // add the downtime for each config together
          up: configs.reduce((acc: number, config) => {
            return acc + config.nodes_status.up;
          }, 0), // add the uptime for each config together
          configPorts: configs.reduce((acc: [number], config) => {
            return [...acc, { configId: config.id, port: config.port }];
          }, []),
        };
      })
      .then((nodeBalancer: ExtendedNodeBalancer) => {
        this.setState({ nodeBalancer });
        this.props.clearLoadingAndErrors();
      })
      .catch((error) => {
        if (!this.state.nodeBalancer) {
          this.props.setErrorAndClearLoading(
            getErrorStringOrDefault(
              error,
              'There was an error loading your NodeBalancer.'
            )
          );
        }
      });

  componentDidMount() {
    const { nodeBalancerId } = this.props.match.params;

    // On initial load only, we want a loading state.
    this.props.setLoadingAndClearErrors();
    if (!nodeBalancerId) {
      this.props.setErrorAndClearLoading('NodeBalancer ID param not set.');
      return;
    }
    this.requestNodeBalancer(+nodeBalancerId);

    // Update NB information every 30 seconds, so that we have an accurate picture of nodes
    this.pollInterval = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        this.requestNodeBalancer(+nodeBalancerId);
      }
    }, 30 * 1000);
  }

  componentWillUnmount() {
    clearInterval(this.pollInterval);
  }

  updateLabel = (label: string) => {
    const { nodeBalancer } = this.state;
    const {
      nodeBalancerActions: { updateNodeBalancer },
    } = this.props;

    // This should never actually happen, but TypeScript is expecting a Promise here.
    if (nodeBalancer === undefined) {
      return Promise.resolve();
    }

    this.setState({ ApiError: undefined });

    return updateNodeBalancer({ nodeBalancerId: nodeBalancer.id, label })
      .then(() => {
        this.setState({
          nodeBalancer: { ...nodeBalancer, label },
          labelInput: label,
        });
      })
      .catch((error) => {
        this.setState(
          () => ({
            ApiError: getAPIErrorOrDefault(
              error,
              'Error updating label',
              'label'
            ),
            labelInput: label,
          }),
          () => {
            scrollErrorIntoView();
          }
        );
        return Promise.reject(error);
      });
  };

  updateTags = (tags: string[]) => {
    const { nodeBalancer } = this.state;
    const {
      nodeBalancerActions: { updateNodeBalancer },
    } = this.props;

    if (nodeBalancer === undefined) {
      return;
    }

    return updateNodeBalancer({ nodeBalancerId: nodeBalancer.id, tags })
      .then(() => {
        this.setState({
          nodeBalancer: { ...nodeBalancer, tags },
          ApiError: undefined,
        });
      })
      .catch((error) => {
        const ApiError = getAPIErrorOrDefault(error, 'Error creating tag');
        this.setState({
          ApiError,
        });
        return Promise.reject(ApiError);
      });
  };

  cancelUpdate = () => {
    this.setState({
      ApiError: undefined,
      labelInput: pathOr('', ['label'], this.state.nodeBalancer),
    });
  };

  getLabelLink = (): string | undefined => {
    return last(location.pathname.split('/')) !== 'summary'
      ? 'summary'
      : undefined;
  };

  static docs: Linode.Doc[] = [
    {
      title: 'Getting Started with NodeBalancers',
      src:
        'https://www.linode.com/docs/platform/nodebalancer/getting-started-with-nodebalancers-new-manager/',
      body: `Using a NodeBalancer to begin managing a simple web application`,
    },
    {
      title: 'NodeBalancer Reference Guide',
      src:
        'https://www.linode.com/docs/platform/nodebalancer/nodebalancer-reference-guide-new-manager/',
      body: `NodeBalancer Reference Guide`,
    },
  ];

  tabs = [
    {
      routeName: `${this.props.match.url}/summary`,
      title: 'Summary',
    },
    {
      routeName: `${this.props.match.url}/configurations`,
      title: 'Configurations',
    },
    {
      routeName: `${this.props.match.url}/settings`,
      title: 'Settings',
    },
  ];

  updateNodeBalancerState = (data: NodeBalancer) => {
    if (this.state.nodeBalancer) {
      this.setState({
        nodeBalancer: {
          ...this.state.nodeBalancer,
          label: data.label,
          client_conn_throttle: data.client_conn_throttle,
        },
        labelInput: data.label,
      });
    }
  };

  render() {
    const matches = (pathName: string) =>
      Boolean(matchPath(this.props.location.pathname, { path: pathName }));
    const { classes, error, loading } = this.props;
    const { nodeBalancer } = this.state;

    /** Loading State */
    if (loading) {
      return <CircleProgress />;
    }

    /** Error State */
    if (error) {
      return (
        <ErrorState errorText="There was an error retrieving your NodeBalancer. Please reload and try again." />
      );
    }

    /** Empty State */
    if (!nodeBalancer) {
      return null;
    }

    const errorMap = getErrorMap(['label'], this.state.ApiError);
    const labelError = errorMap.label;

    const nodeBalancerLabel =
      this.state.labelInput !== undefined
        ? this.state.labelInput
        : nodeBalancer.label;

    const p = {
      updateTags: this.updateTags,
    };

    const navToURL = (index: number) => {
      this.props.history.push(this.tabs[index].routeName);
    };

    return (
      <NodeBalancerProvider value={p}>
        <React.Fragment>
          <Grid
            container
            className={`${classes.root} m0`}
            justifyContent="space-between"
          >
            <Grid item className="p0">
              <Breadcrumb
                pathname={`/nodebalancers/${nodeBalancerLabel}`}
                firstAndLastOnly
                onEditHandlers={{
                  editableTextTitle: nodeBalancerLabel,
                  onEdit: this.updateLabel,
                  onCancel: this.cancelUpdate,
                  errorText: labelError,
                }}
              />
            </Grid>
            <Grid item className="p0" style={{ marginTop: 14 }}>
              <DocsLink href="https://www.linode.com/docs/guides/getting-started-with-nodebalancers/" />
            </Grid>
          </Grid>
          {errorMap.none && <Notice error text={errorMap.none} />}
          <Tabs
            index={Math.max(
              this.tabs.findIndex((tab) => matches(tab.routeName)),
              0
            )}
            onChange={navToURL}
          >
            <TabLinkList tabs={this.tabs} />

            <TabPanels>
              <SafeTabPanel index={0}>
                <NodeBalancerSummary
                  nodeBalancer={nodeBalancer}
                  errorResponses={pathOr(
                    undefined,
                    ['location', 'state', 'errors'],
                    this.props
                  )}
                />
              </SafeTabPanel>

              <SafeTabPanel index={1}>
                <NodeBalancerConfigurations
                  nodeBalancerLabel={nodeBalancer.label}
                  nodeBalancerRegion={nodeBalancer.region}
                />
              </SafeTabPanel>

              <SafeTabPanel index={2}>
                <NodeBalancerSettings
                  nodeBalancerId={nodeBalancer.id}
                  nodeBalancerLabel={nodeBalancer.label}
                  nodeBalancerClientConnThrottle={
                    nodeBalancer.client_conn_throttle
                  }
                  updateNodeBalancerDetailState={this.updateNodeBalancerState}
                />
              </SafeTabPanel>
            </TabPanels>
          </Tabs>
        </React.Fragment>
      </NodeBalancerProvider>
    );
  }
}

const styled = withStyles(styles);

const reloaded = reloadableWithRouter<
  CombinedProps,
  { nodeBalancerId?: number }
>((routePropsOld, routePropsNew) => {
  return (
    routePropsOld.match.params.nodeBalancerId !==
    routePropsNew.match.params.nodeBalancerId
  );
});

export default compose(
  setDocs(NodeBalancerDetail.docs),
  reloaded,
  withFeatureFlagConsumerContainer,
  withSnackbar,
  withNodeBalancerActions,
  withLoadingAndError,
  styled
)(NodeBalancerDetail);
