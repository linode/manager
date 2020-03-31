import { getKubernetesClusterEndpoint } from 'linode-js-sdk/lib/kubernetes';
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
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import ErrorState from 'src/components/ErrorState';
import KubeContainer, {
  DispatchProps
} from 'src/containers/kubernetes.container';
import withTypes, { WithTypesProps } from 'src/containers/types.container';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { ExtendedCluster } from '.././types';
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
      marginTop: theme.spacing(3)
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
      marginBottom: theme.spacing(1) + 4
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

  React.useEffect(() => {
    const clusterID = +props.match.params.clusterID;
    if (clusterID) {
      props.requestClusterForStore(clusterID).catch(_ => null); // Handle in Redux
      // The cluster endpoint has its own API...uh, endpoint, so we need
      // to request it separately.
      setEndpointLoading(true);
      getKubernetesClusterEndpoint(clusterID)
        .then(response => {
          setEndpointError(undefined);
          setEndpoint(response.endpoints[0]); // @todo will there ever be multiple values here?
          setEndpointLoading(false);
        })
        .catch(error => {
          setEndpointLoading(false);
          setEndpointError(
            getAPIErrorOrDefault(error, 'Cluster endpoint not available.')[0]
              .reason
          );
        });
    }

    const interval = setInterval(
      () => props.requestNodePools(+props.match.params.clusterID),
      10000
    );

    return () => {
      clearInterval(interval);
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
      <Grid container className={classes.titleGridWrapper}>
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
        <AppBar position="static" color="default" role="tablist">
          <Tabs
            value={0}
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="on"
            className={classes.tabBar}
          >
            <Tab key="Summary" label="Summary" data-qa-tab="Summary" />}
          </Tabs>
        </AppBar>
        <Grid item xs={12} className={classes.section}>
          <KubeSummaryPanel
            cluster={cluster}
            endpoint={endpoint}
            endpointError={endpointError}
            endpointLoading={endpointLoading}
          />
        </Grid>
        <Grid item xs={12}>
          <NodePoolsDisplay
            editing={false}
            pools={cluster.node_pools}
            poolsForEdit={[]}
            types={props.typesData || []}
            loading={props.nodePoolsLoading}
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
