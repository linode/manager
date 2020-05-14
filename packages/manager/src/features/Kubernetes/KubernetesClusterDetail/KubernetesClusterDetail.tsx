import {
  getKubeConfig,
  getKubernetesClusterEndpoints,
  KubernetesEndpointResponse
} from 'linode-js-sdk/lib/kubernetes';
import { APIError } from 'linode-js-sdk/lib/types';
import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import Breadcrumb from 'src/components/Breadcrumb';
import CircleProgress from 'src/components/CircleProgress';
import AppBar from 'src/components/core/AppBar';
import Grid from 'src/components/core/Grid';
import {
  createStyles,
  Theme,
  WithStyles,
  withStyles
} from 'src/components/core/styles';
import Tab from 'src/components/core/Tab';
import Tabs from 'src/components/core/Tabs';
import DocumentationButton from 'src/components/DocumentationButton';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import ErrorState from 'src/components/ErrorState';
import KubeContainer, {
  DispatchProps
} from 'src/containers/kubernetes.container';
import withTypes, { WithTypesProps } from 'src/containers/types.container';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { getAllWithArguments } from 'src/utilities/getAll';
import { ExtendedCluster, PoolNodeWithPrice } from '.././types';
import KubeSummaryPanel from './KubeSummaryPanel';
import NodePoolsDisplay from './NodePoolsDisplay';

type ClassNames =
  | 'root'
  | 'title'
  | 'tabBar'
  | 'backButton'
  | 'section'
  | 'button'
  | 'titleGridWrapper'
  | 'tagHeading';

const styles = (theme: Theme) =>
  createStyles({
    root: {},
    title: {},
    tabBar: {
      marginTop: 0
    },
    backButton: {
      margin: '-6px 0 0 -16px',
      '& svg': {
        width: 34,
        height: 34
      },
      padding: 0
    },
    section: {
      alignItems: 'flex-start'
    },
    button: {
      marginBottom: theme.spacing(3),
      [theme.breakpoints.down('sm')]: {
        order: 2
      },
      '& button': {
        [theme.breakpoints.only('md')]: {
          padding: `${theme.spacing(2)}px ${theme.spacing(1)}px`
        }
      }
    },
    titleGridWrapper: {
      marginBottom: theme.spacing(1)
    },
    tagHeading: {
      marginBottom: theme.spacing(1) + 4
    }
  });
interface KubernetesContainerProps {
  cluster: ExtendedCluster | null;
  clustersLoading: boolean;
  clustersLoadError?: APIError[];
  clusterDeleteError?: APIError[];
  lastUpdated: number;
  nodePoolsLoading: boolean;
}

type CombinedProps = WithTypesProps &
  RouteComponentProps<{ clusterID: string }> &
  KubernetesContainerProps &
  DispatchProps &
  WithStyles<ClassNames>;

const getAllEndpoints = getAllWithArguments<KubernetesEndpointResponse>(
  getKubernetesClusterEndpoints
);

export const KubernetesClusterDetail: React.FunctionComponent<CombinedProps> = props => {
  const {
    classes,
    cluster,
    clustersLoadError,
    clustersLoading,
    lastUpdated,
    location
  } = props;

  const [endpoint, setEndpoint] = React.useState<string | null>(null);
  const [endpointError, setEndpointError] = React.useState<string | undefined>(
    undefined
  );
  const [endpointLoading, setEndpointLoading] = React.useState<boolean>(false);

  const [updateError, setUpdateError] = React.useState<string | undefined>();

  const [kubeconfigAvailable, setKubeconfigAvailability] = React.useState<
    boolean
  >(false);
  const [kubeconfigError, setKubeconfigError] = React.useState<
    string | undefined
  >(undefined);

  const endpointAvailabilityInterval = React.useRef<number>();
  const kubeconfigAvailabilityInterval = React.useRef<number>();

  const getEndpointToDisplay = (endpoints: string[]) => {
    // Per discussions with the API team and UX, we should display only the endpoint with port 443, so we are matching on that.
    return endpoints.find(thisResponse =>
      thisResponse.match(/linodelke\.net:443$/i)
    );
  };

  const successfulClusterEndpointResponse = (endpoints: string[]) => {
    setEndpointError(undefined);

    const endpointToDisplay = getEndpointToDisplay(endpoints);

    setEndpoint(endpointToDisplay ?? null);
    setEndpointLoading(false);
    clearInterval(endpointAvailabilityInterval.current);
  };

  // Create a function to check if the Kubeconfig is available.
  const kubeconfigAvailabilityCheck = (
    clusterID: number,
    startInterval: boolean = false
  ) => {
    getKubeConfig(clusterID)
      .then(() => {
        kubeconfigAvailableEndInterval();
      })
      .catch(error => {
        if (startInterval) {
          setKubeconfigAvailability(false);

          if (error?.[0]?.reason.match(/not yet available/i)) {
            // If it is not yet available, set kubeconfigAvailabilityInterval equal to function that continues polling the endpoint every 30 seconds to grab it when it is
            kubeconfigAvailabilityInterval.current = window.setInterval(() => {
              kubeconfigAvailabilityCheck(clusterID);
            }, 30 * 1000);
          } else {
            setKubeconfigError(
              getAPIErrorOrDefault(error, 'Kubeconfig not available.')[0].reason
            );
          }
        }
      });
  };

  const kubeconfigAvailableEndInterval = () => {
    setKubeconfigAvailability(true);
    clearInterval(kubeconfigAvailabilityInterval.current);
  };

  React.useEffect(() => {
    const clusterID = +props.match.params.clusterID;
    if (clusterID) {
      // A function to check if the endpoint is available.
      const endpointAvailabilityCheck = () => {
        getAllEndpoints([clusterID])
          .then(response => {
            successfulClusterEndpointResponse(
              response.data.map(thisEndpoint => thisEndpoint.endpoint)
            );
          })
          .catch(_error => {
            // Do nothing since endpoint is null by default, and in the instances where this function is called, endpointAvailabilityInterval has been set in motion already.
          });
      };

      props.requestClusterForStore(clusterID).catch(_ => null); // Handle in Redux
      // The cluster endpoint has its own API...uh, endpoint, so we need
      // to request it separately.
      setEndpointLoading(true);
      getAllEndpoints([clusterID])
        .then(response => {
          successfulClusterEndpointResponse(
            response.data.map(thisEndpoint => thisEndpoint.endpoint)
          );
        })
        .catch(error => {
          setEndpointLoading(false);

          // If the error is that the endpoint is not yet available, set endpointAvailabilityInterval equal to function that continues polling the endpoint every 5 seconds to grab it when it is.
          if (error?.[0]?.reason.match(/endpoints are not yet available/i)) {
            endpointAvailabilityInterval.current = window.setInterval(() => {
              endpointAvailabilityCheck();
            }, 5000);
          } else {
            setEndpointError(
              getAPIErrorOrDefault(error, 'Cluster endpoint not available.')[0]
                .reason
            );
          }
        });

      kubeconfigAvailabilityCheck(clusterID, true);
    }

    const interval = setInterval(
      () => props.requestNodePools(+props.match.params.clusterID),
      10000
    );

    return () => {
      clearInterval(interval);
      clearInterval(endpointAvailabilityInterval.current);
      clearInterval(kubeconfigAvailabilityInterval.current);
    };
  }, []);

  if (clustersLoadError) {
    const error = getAPIErrorOrDefault(
      clustersLoadError,
      'Unable to load cluster data.'
    )[0].reason;
    return <ErrorState errorText={error} />;
  }

  if (
    (clustersLoading && lastUpdated === 0) ||
    props.nodePoolsLoading ||
    props.typesLoading
  ) {
    return <CircleProgress />;
  }

  if (cluster === null) {
    return null;
  }

  const handleLabelChange = (newLabel: string) => {
    setUpdateError(undefined);

    return props
      .updateCluster({ clusterID: cluster.id, label: newLabel })
      .catch(e => {
        setUpdateError(e[0].reason);
        return Promise.reject(e);
      });
  };

  const resetEditableLabel = () => {
    setUpdateError(undefined);
    return cluster.label;
  };

  return (
    <React.Fragment>
      <DocumentTitleSegment segment={`Kubernetes Cluster ${cluster.label}`} />
      <Grid
        container
        className={classes.titleGridWrapper}
        direction="row"
        wrap="nowrap"
        justify="space-between"
        alignItems="flex-start"
      >
        <Grid item xs={12}>
          <Breadcrumb
            onEditHandlers={{
              editableTextTitle: cluster.label,
              onEdit: handleLabelChange,
              onCancel: resetEditableLabel,
              errorText: updateError
            }}
            firstAndLastOnly
            pathname={location.pathname}
            data-qa-breadcrumb
          />
        </Grid>
        <Grid item className="pt0">
          <DocumentationButton href="https://www.linode.com/docs/kubernetes/deploy-and-manage-a-cluster-with-linode-kubernetes-engine-a-tutorial/" />
        </Grid>
      </Grid>
      <Grid item>
        <Grid item xs={12}>
          <AppBar position="static" color="default" role="tablist">
            <Tabs
              value={0}
              indicatorColor="primary"
              textColor="primary"
              variant="scrollable"
              scrollButtons="on"
              className={classes.tabBar}
            >
              <Tab key="Summary" label="Summary" data-qa-tab="Summary" />
            </Tabs>
          </AppBar>
        </Grid>
        <Grid item xs={12} className={classes.section}>
          <KubeSummaryPanel
            cluster={cluster}
            endpoint={endpoint}
            endpointError={endpointError}
            endpointLoading={endpointLoading}
            kubeconfigAvailable={kubeconfigAvailable}
            kubeconfigError={kubeconfigError}
            handleUpdateTags={(newTags: string[]) =>
              props.updateCluster({
                clusterID: cluster.id,
                tags: newTags
              })
            }
          />
        </Grid>
        <Grid item xs={12}>
          <NodePoolsDisplay
            clusterLabel={cluster.label}
            pools={cluster.node_pools}
            types={props.typesData || []}
            addNodePool={(pool: PoolNodeWithPrice) =>
              props.createNodePool({
                clusterID: cluster.id,
                type: pool.type,
                count: pool.count
              })
            }
            updatePool={(id: number, updatedPool: PoolNodeWithPrice) =>
              props.updateNodePool({
                clusterID: cluster.id,
                nodePoolID: id,
                type: updatedPool.type,
                count: updatedPool.count
              })
            }
            deletePool={(poolID: number) =>
              props.deleteNodePool({
                clusterID: cluster.id,
                nodePoolID: poolID
              })
            }
          />
        </Grid>
      </Grid>
    </React.Fragment>
  );
};

const styled = withStyles(styles);

const withCluster = KubeContainer<
  {},
  WithTypesProps & RouteComponentProps<{ clusterID: string }>
>(
  (
    ownProps,
    clustersLoading,
    lastUpdated,
    clustersError,
    clustersData,
    nodePoolsLoading
  ) => {
    const cluster =
      clustersData.find(c => +c.id === +ownProps.match.params.clusterID) ||
      null;
    return {
      ...ownProps,
      cluster,
      lastUpdated,
      clustersLoading,
      clustersLoadError: clustersError.read,
      clusterDeleteError: clustersError.delete,
      nodePoolsLoading
    };
  }
);

const enhanced = compose<CombinedProps, RouteComponentProps>(
  styled,
  withTypes,
  withCluster
);

export default enhanced(KubernetesClusterDetail);
