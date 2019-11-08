import { getKubernetesClusterEndpoint } from 'linode-js-sdk/lib/kubernetes';
import { APIError } from 'linode-js-sdk/lib/types';
import { path } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';

import Breadcrumb from 'src/components/Breadcrumb';
import Button from 'src/components/Button';
import CircleProgress from 'src/components/CircleProgress';
import Grid from 'src/components/core/Grid';
import {
  createStyles,
  Theme,
  WithStyles,
  withStyles
} from 'src/components/core/styles';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import ErrorState from 'src/components/ErrorState';
import KubeContainer, {
  DispatchProps
} from 'src/containers/kubernetes.container';
import withTypes, { WithTypesProps } from 'src/containers/types.container';

import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { ExtendedCluster } from '.././types';
import KubeConfigPanel from './KubeConfigPanel';
import KubernetesDialog from './KubernetesDialog';
import KubeSummaryPanel from './KubeSummaryPanel';

import Navigation from './DetailNavigation';

type ClassNames =
  | 'root'
  | 'title'
  | 'titleWrapper'
  | 'backButton'
  | 'section'
  | 'panelItem'
  | 'button'
  | 'deleteSection'
  | 'titleGridWrapper'
  | 'tagHeading'
  | 'sectionMain'
  | 'sectionSideBar';

const styles = (theme: Theme) =>
  createStyles({
    root: {},
    title: {},
    titleWrapper: {
      display: 'flex',
      alignItems: 'center'
    },
    backButton: {
      margin: '-6px 0 0 -16px',
      '& svg': {
        width: 34,
        height: 34
      },
      padding: 0
    },
    section: {},
    panelItem: {},
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
    deleteSection: {
      [theme.breakpoints.up('md')]: {
        marginLeft: theme.spacing(3)
      }
    },
    titleGridWrapper: {
      marginBottom: theme.spacing(1) + 4
    },
    tagHeading: {
      marginBottom: theme.spacing(1) + 4
    },
    sectionMain: {
      [theme.breakpoints.up('md')]: {
        order: 1
      }
    },
    sectionSideBar: {
      [theme.breakpoints.up('md')]: {
        order: 2,
        display: 'inline-block'
      }
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

export const KubernetesClusterDetail: React.FunctionComponent<
  CombinedProps
> = props => {
  const {
    classes,
    cluster,
    clusterDeleteError,
    clustersLoadError,
    clustersLoading,
    lastUpdated,
    location,
    ...rest
  } = props;

  /** Deletion confirmation modal */
  const [confirmationOpen, setConfirmation] = React.useState<boolean>(false);
  const [deleting, setDeleting] = React.useState<boolean>(false);
  const [endpoint, setEndpoint] = React.useState<string | null>(null);
  const [endpointError, setEndpointError] = React.useState<string | undefined>(
    undefined
  );
  const [endpointLoading, setEndpointLoading] = React.useState<boolean>(false);

  React.useEffect(() => {
    const clusterID = +props.match.params.clusterID;
    if (clusterID) {
      props.requestClusterForStore(clusterID);
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

  const handleDeleteCluster = () => {
    setDeleting(true);
    props
      .deleteCluster({ clusterID: cluster.id })
      .then(() => props.history.push('/kubernetes'))
      .catch(_ => setDeleting(false)); // Handle errors through Redux
  };

  const openDeleteConfirmation = () => {
    props.setKubernetesErrors({ delete: undefined });
    setConfirmation(true);
  };

  const handleLabelChange = async (newLabel: string) => {
    props.updateCluster({ clusterID: cluster.id, label: newLabel });
    return cluster.label;
  };

  const resetEditableLabel = () => {
    return cluster.label;
  };

  return (
    <React.Fragment>
      <DocumentTitleSegment segment={`Kubernetes Cluster ${cluster.label}`} />
      <Grid
        container
        justify="space-between"
        alignItems="flex-end"
        spacing={3}
        className={classes.titleGridWrapper}
      >
        <Grid item xs={12} className={classes.titleWrapper}>
          <Breadcrumb
            onEditHandlers={{
              editableTextTitle: cluster.label,
              onEdit: handleLabelChange,
              onCancel: resetEditableLabel
            }}
            removeCrumbX={2}
            pathname={location.pathname}
            data-qa-breadcrumb
          />
        </Grid>
      </Grid>

      <Grid container direction="row" className={classes.section} spacing={3}>
        <Grid
          container
          item
          direction="row"
          className={classes.sectionSideBar}
          xs={12}
          md={3}
        >
          <Grid item xs={12} className={classes.button}>
            <KubeConfigPanel
              clusterID={cluster.id}
              clusterLabel={cluster.label}
            />
          </Grid>
          <Grid item xs={12} className={classes.section}>
            <KubeSummaryPanel
              cluster={cluster}
              endpoint={endpoint}
              endpointError={endpointError}
              endpointLoading={endpointLoading}
            />
          </Grid>
        </Grid>
        <Grid
          container
          item
          direction="row"
          xs={12}
          md={9}
          className={classes.sectionMain}
        >
          <Navigation
            location={location}
            cluster={cluster}
            updateCluster={props.updateCluster}
            updateNodePool={props.updateNodePool}
            {...rest}
          />
          {/* <Grid item xs={12}>
            <NodePoolsDisplay
              submittingForm={submitting}
              submitForm={submitForm}
              submissionSuccess={success}
              submissionError={generalError}
              editing={editing}
              toggleEditing={toggleEditing}
              updatePool={updatePool}
              deletePool={handleDeletePool}
              resetForm={resetFormState}
              pools={cluster.node_pools}
              poolsForEdit={pools}
              types={typesData || []}
              loading={nodePoolsLoading}
            />
          </Grid>
          <Grid item xs={12}>
            <NodePoolPanel
              hideTable
              selectedType={selectedType}
              types={typesData || []}
              nodeCount={count}
              addNodePool={handleAddNodePool}
              handleTypeSelect={newType => setSelectedType(newType)}
              updateNodeCount={newCount => setCount(newCount)}
              typesLoading={typesLoading}
              typesError={
                typesError
                  ? getAPIErrorOrDefault(
                      typesError,
                      'Error loading Linode type information.'
                    )[0].reason
                  : undefined
              }
            />
          </Grid> */}
          <Grid item xs={12} className={classes.deleteSection}>
            <Button
              destructive
              buttonType="secondary"
              onClick={openDeleteConfirmation}
            >
              Delete Cluster
            </Button>
          </Grid>
        </Grid>
      </Grid>
      <KubernetesDialog
        open={confirmationOpen}
        loading={deleting}
        error={path([0, 'reason'], clusterDeleteError)}
        clusterLabel={cluster.label}
        clusterPools={cluster.node_pools}
        onClose={() => setConfirmation(false)}
        onDelete={handleDeleteCluster}
      />
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

const enhanced = compose<CombinedProps, {}>(
  styled,
  withTypes,
  withCluster,
  withRouter
);

export default enhanced(KubernetesClusterDetail);
