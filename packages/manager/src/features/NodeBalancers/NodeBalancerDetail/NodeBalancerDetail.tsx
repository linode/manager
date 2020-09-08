import {
  getNodeBalancer,
  getNodeBalancerConfigs
} from '@linode/api-v4/lib/nodebalancers';
import { APIError } from '@linode/api-v4/lib/types';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import { last, pathOr } from 'ramda';
import * as React from 'react';
import { matchPath, RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import Breadcrumb from 'src/components/Breadcrumb';
import CircleProgress from 'src/components/CircleProgress';
import {
  createStyles,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import SafeTabPanel from 'src/components/SafeTabPanel';
import TabPanels from 'src/components/core/ReachTabPanels';
import Tabs from 'src/components/core/ReachTabs';
import TabLinkList from 'src/components/TabLinkList';
import setDocs from 'src/components/DocsSidebar/setDocs';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import withLoadingAndError, {
  LoadingAndErrorHandlers,
  LoadingAndErrorState
} from 'src/components/withLoadingAndError';
import reloadableWithRouter from 'src/features/linodes/LinodesDetail/reloadableWithRouter';
import {
  withNodeBalancerActions,
  WithNodeBalancerActions
} from 'src/store/nodeBalancer/nodeBalancer.containers';
import {
  getAPIErrorOrDefault,
  getErrorMap,
  getErrorStringOrDefault
} from 'src/utilities/errorUtils';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import { ExtendedNodeBalancer } from '../types';
import { NodeBalancerProvider } from './context';
import NodeBalancerConfigurations from './NodeBalancerConfigurations';
import NodeBalancerSettings from './NodeBalancerSettings';
import NodeBalancerSummary from './NodeBalancerSummary';

type ClassNames = 'root' | 'backButton';

const styles = () =>
  createStyles({
    root: {},
    backButton: {
      margin: '5px 0 0 -16px',
      '& svg': {
        width: 34,
        height: 34
      }
    }
  });

type RouteProps = RouteComponentProps<{ nodeBalancerId?: string }>;

interface State {
  nodeBalancer?: ExtendedNodeBalancer;
  ApiError: APIError[] | undefined;
  labelInput?: string;
}

type CombinedProps = WithNodeBalancerActions &
  WithSnackbarProps &
  RouteProps &
  LoadingAndErrorHandlers &
  LoadingAndErrorState &
  WithStyles<ClassNames>;

class NodeBalancerDetail extends React.Component<CombinedProps, State> {
  state: State = {
    nodeBalancer: undefined,
    ApiError: undefined
  };

  pollInterval: number;

  requestNodeBalancer = (nodeBalancerId: number) =>
    Promise.all([
      getNodeBalancer(+nodeBalancerId),
      getNodeBalancerConfigs(+nodeBalancerId)
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
          }, [])
        };
      })
      .then((nodeBalancer: ExtendedNodeBalancer) => {
        this.setState({ nodeBalancer });
        this.props.clearLoadingAndErrors();
      })
      .catch(error => {
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
    this.pollInterval = window.setInterval(
      () => this.requestNodeBalancer(+nodeBalancerId),
      30 * 1000
    );
  }

  componentWillUnmount() {
    clearInterval(this.pollInterval);
  }

  updateLabel = (label: string) => {
    const { nodeBalancer } = this.state;
    const {
      nodeBalancerActions: { updateNodeBalancer }
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
          labelInput: label
        });
      })
      .catch(error => {
        this.setState(
          () => ({
            ApiError: getAPIErrorOrDefault(
              error,
              'Error updating label',
              'label'
            ),
            labelInput: label
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
      nodeBalancerActions: { updateNodeBalancer }
    } = this.props;

    if (nodeBalancer === undefined) {
      return;
    }

    return updateNodeBalancer({ nodeBalancerId: nodeBalancer.id, tags })
      .then(() => {
        this.setState({
          nodeBalancer: { ...nodeBalancer, tags },
          ApiError: undefined
        });
      })
      .catch(error => {
        const ApiError = getAPIErrorOrDefault(error, 'Error creating tag');
        this.setState({
          ApiError
        });
        return Promise.reject(ApiError);
      });
  };

  cancelUpdate = () => {
    this.setState({
      ApiError: undefined,
      labelInput: pathOr('', ['label'], this.state.nodeBalancer)
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
      body: `Using a NodeBalancer to begin managing a simple web application`
    },
    {
      title: 'NodeBalancer Reference Guide',
      src:
        'https://www.linode.com/docs/platform/nodebalancer/nodebalancer-reference-guide-new-manager/',
      body: `NodeBalancer Reference Guide`
    }
  ];

  tabs = [
    {
      routeName: `${this.props.match.url}/summary`,
      title: 'Summary'
    },
    {
      routeName: `${this.props.match.url}/configurations`,
      title: 'Configurations'
    },
    {
      routeName: `${this.props.match.url}/settings`,
      title: 'Settings'
    }
  ];

  render() {
    const matches = (pathName: string) =>
      Boolean(matchPath(this.props.location.pathname, { path: pathName }));
    const { error, loading } = this.props;
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
      updateTags: this.updateTags
    };

    return (
      <NodeBalancerProvider value={p}>
        <React.Fragment>
          <Grid container justify="space-between">
            <Grid item>
              <Breadcrumb
                pathname={`/NodeBalancers/${nodeBalancerLabel}`}
                firstAndLastOnly
                onEditHandlers={{
                  editableTextTitle: nodeBalancerLabel,
                  onEdit: this.updateLabel,
                  onCancel: this.cancelUpdate,
                  errorText: labelError
                }}
              />
            </Grid>
          </Grid>
          {errorMap.none && <Notice error text={errorMap.none} />}
          <Tabs
            defaultIndex={Math.max(
              this.tabs.findIndex(tab => matches(tab.routeName)),
              0
            )}
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
  styled,
  withSnackbar,
  withNodeBalancerActions,
  withLoadingAndError
)(NodeBalancerDetail);
