import * as Bluebird from 'bluebird';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import { contains, path, remove, update } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';

import Breadcrumb from 'src/components/Breadcrumb';
import Button from 'src/components/Button';
import CircleProgress from 'src/components/CircleProgress';
import Grid from 'src/components/core/Grid';
import Paper from 'src/components/core/Paper';
import {
  createStyles,
  Theme,
  WithStyles,
  withStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import ErrorState from 'src/components/ErrorState';
import TagsPanel from 'src/components/TagsPanel';
import KubeContainer, {
  DispatchProps
} from 'src/containers/kubernetes.container';
import withTypes, { WithTypesProps } from 'src/containers/types.container';
import { reportException } from 'src/exceptionReporting';
import { getKubeConfig } from 'src/services/kubernetes';
import { downloadFile } from 'src/utilities/downloadFile';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { extendCluster, getMonthlyPrice } from '.././kubeUtils';
import { ExtendedCluster, ExtendedPoolNode } from '.././types';
import NodePoolPanel from '../CreateCluster/NodePoolPanel';
import KubernetesDialog from './KubernetesDialog';
import KubeSummaryPanel from './KubeSummaryPanel';
import NodePoolsDisplay from './NodePoolsDisplay';

type ClassNames =
  | 'root'
  | 'title'
  | 'titleWrapper'
  | 'backButton'
  | 'section'
  | 'panelItem'
  | 'button';

const styles = (theme: Theme) =>
  createStyles({
    root: {},
    title: {
      display: 'flex',
      alignItems: 'center',
      padding: theme.spacing(1)
    },
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
    section: {
      margin: theme.spacing(2)
    },
    panelItem: {
      padding: theme.spacing(1)
    },
    button: {
      marginLeft: theme.spacing(2)
    }
  });
interface KubernetesContainerProps {
  cluster: ExtendedCluster | null;
  clustersLoading: boolean;
  clustersLoadError?: Linode.ApiFieldError[];
  clusterDeleteError?: Linode.ApiFieldError[];
  lastUpdated: number;
}

type CombinedProps = WithTypesProps &
  RouteComponentProps<{ clusterID: string }> &
  KubernetesContainerProps &
  WithSnackbarProps &
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
    enqueueSnackbar,
    lastUpdated,
    typesData,
    typesError,
    typesLoading
  } = props;

  const [editing, setEditing] = React.useState<boolean>(false);
  /** Holds the local state of the cluster's node pools when editing */
  const [pools, updatePools] = React.useState<ExtendedPoolNode[]>([]);
  /** When adding new pools in the NodePoolPanel component, use these variables. */
  const [selectedType, setSelectedType] = React.useState<string | undefined>(
    undefined
  );
  const [count, setCount] = React.useState<number>(1);
  /** For adding tags */
  const [tags, updateTags] = React.useState<string[]>([]);
  /** Form submission */
  const [submitting, setSubmitting] = React.useState<boolean>(false);
  const [generalError, setErrors] = React.useState<
    Linode.ApiFieldError[] | undefined
  >(undefined);
  const [success, setSuccess] = React.useState<boolean>(false);
  /** Deletion confirmation modal */
  const [confirmationOpen, setConfirmation] = React.useState<boolean>(false);
  const [deleting, setDeleting] = React.useState<boolean>(false);

  React.useEffect(() => {
    /**
     * Eventually the clusters request will probably be made from App.tsx
     * (to facilitate searching), but for now if a user navigates directly
     * to this url without going through KubernetesLanding the clusters won't have
     * been requested yet.
     */
    if (props.lastUpdated === 0) {
      props.requestKubernetesClusters();
    } else {
      const clusterID = props.match.params.clusterID;
      props.requestClusterForStore(+clusterID);
    }
  }, []);

  if (clustersLoadError) {
    return <ErrorState errorText="Unable to load cluster data." />;
  }

  if ((clustersLoading && lastUpdated !== 0) || typesLoading) {
    return <CircleProgress />;
  }
  if (cluster === null) {
    return null;
  }

  const submitForm = () => {
    /** Fasten your seat belts... */
    setSubmitting(true);
    setErrors(undefined);
    setSuccess(false);
    Bluebird.map(pools, thisPool => {
      if (thisPool.queuedForAddition) {
        // This pool doesn't exist and needs to be added.
        return props.createNodePool({ clusterID: cluster.id, ...thisPool });
      } else if (thisPool.queuedForDeletion) {
        // Marked for deletion
        return props.deleteNodePool({
          clusterID: cluster.id,
          nodePoolID: thisPool.id
        });
      } else if (!contains(thisPool, cluster.node_pools)) {
        /** @todo contains() is deprecated in the next version of Ramda (0.26+). Replace with includes() if we ever upgrade. */

        // User has adjusted the count for this pool. Needs to be pushed through to the API.
        return props.updateNodePool({
          clusterID: cluster.id,
          nodePoolID: thisPool.id,
          count: thisPool.count,
          type: thisPool.type
        });
      } else {
        // Nothing has changed about this node, so don't make any requests.
        return;
      }
    })
      .then(() => {
        setSuccess(true);
        setSubmitting(false);
        setEditing(false);
      })
      .catch(err => {
        setErrors(
          getAPIErrorOrDefault(
            err,
            'Some actions could not be completed. Please try again.'
          )
        );
        setSubmitting(false);
        setEditing(false);
      });
  };

  const updatePool = (poolIdx: number, updatedPool: ExtendedPoolNode) => {
    const updatedPoolWithPrice = {
      ...updatedPool,
      totalMonthlyPrice: getMonthlyPrice(
        updatedPool.type,
        updatedPool.count,
        typesData || []
      )
    };
    updatePools(prevPools => update(poolIdx, updatedPoolWithPrice, prevPools));
  };

  const resetFormState = () => {
    updatePools(cluster.node_pools);
  };

  const toggleEditing = () => {
    /**
     * Regardless of whether we're going into or out of editing mode,
     * reset everything.
     */

    updatePools(cluster.node_pools);
    setEditing(!editing);
    setSuccess(false);
    setErrors(undefined);
  };

  const handleAddNodePool = (pool: ExtendedPoolNode) => {
    if (editing) {
      /** We're already in editing mode, so the list of pool nodes should be accurate */
      updatePools(prevPools => {
        const newPools = [
          ...prevPools,
          {
            ...pool,
            queuedForAddition: true
          }
        ];
        return newPools;
      });
    } else {
      /** From a static state, adding a node pool should trigger editing state */
      setEditing(true);
      /** Make sure the list of node pools is correct */
      updatePools([
        ...cluster.node_pools,
        {
          ...pool,
          queuedForAddition: true
        }
      ]);
    }
  };

  const handleDeletePool = (poolIdx: number) => {
    updatePools(prevPools => {
      const poolToDelete = path<ExtendedPoolNode>([poolIdx], prevPools);
      if (poolToDelete) {
        if (poolToDelete.queuedForAddition) {
          /**
           * This is a new pool in local state that doesn't exist as far as the API is concerned.
           * It can be directly removed.
           */
          return remove(poolIdx, 1, prevPools);
        } else {
          /**
           * This is a "real" node that we don't want users to accidentally delete. Mark it for deletion
           * (it will be handled on form submission).
           */
          const withMarker = {
            ...poolToDelete,
            queuedForDeletion: !Boolean(poolToDelete.queuedForDeletion)
          };
          return update(poolIdx, withMarker, prevPools);
        }
      } else {
        return prevPools;
      }
    });
  };

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

  const downloadKubeConfig = () => {
    /**
     * This is reused from ClusterActionMenu, but there wasn't an easy way
     * to share logic (more than is already abstracted in the downloadFile utility).
     * @todo figure out a better way to keep it DRY
     */
    getKubeConfig(cluster.id)
      .then(response => {
        // Convert to utf-8 from base64
        try {
          const decodedFile = window.atob(response.kubeconfig);
          downloadFile('kubeconfig.yaml', decodedFile);
        } catch (e) {
          reportException(e, {
            'Encoded response': response.kubeconfig
          });
          enqueueSnackbar('Error parsing your kubeconfig file', {
            variant: 'error'
          });
          return;
        }
      })
      .catch(errorResponse => {
        const error = getAPIErrorOrDefault(
          errorResponse,
          'Unable to download your kubeconfig'
        )[0].reason;
        enqueueSnackbar(error, { variant: 'error' });
      });
  };

  const handleUpdateTags = async (newTags: string[]) => {
    props.updateCluster({ clusterID: cluster.id, tags: newTags });
    updateTags(newTags);
  };

  return (
    <React.Fragment>
      <DocumentTitleSegment segment={`Kubernetes Cluster ${'label'}`} />
      <Grid
        container
        justify="space-between"
        alignItems="flex-end"
        style={{ marginTop: 8, marginBottom: 8 }}
      >
        <Grid item className={classes.titleWrapper}>
          <Breadcrumb
            linkTo={{
              pathname: `/kubernetes`
            }}
            linkText="Clusters"
            labelTitle={cluster.label}
            data-qa-breadcrumb
          />
        </Grid>
      </Grid>

      <Grid container direction="row" className={classes.section}>
        <Grid container item direction="column" xs={9}>
          <Grid item>
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
            />
          </Grid>
          <Grid item>
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
          </Grid>
          <Grid item className={classes.section}>
            <Button
              destructive
              buttonType="secondary"
              onClick={openDeleteConfirmation}
            >
              Delete Cluster
            </Button>
          </Grid>
        </Grid>
        <Grid container item direction="column" xs={3}>
          <Grid item className={classes.button}>
            <Button buttonType="primary" onClick={downloadKubeConfig}>
              Download kubeconfig
            </Button>
          </Grid>
          <Grid item className={classes.section}>
            <KubeSummaryPanel cluster={cluster} />
          </Grid>
          <Grid item className={classes.section}>
            <Paper>
              <Typography variant="h3" className={classes.title} data-qa-title>
                Cluster Tags
              </Typography>
              <div className={classes.panelItem}>
                <TagsPanel tags={tags} updateTags={handleUpdateTags} />
              </div>
            </Paper>
          </Grid>
        </Grid>
      </Grid>
      <KubernetesDialog
        open={confirmationOpen}
        loading={deleting}
        error={path([0, 'reason'], clusterDeleteError)}
        clusterLabel={cluster.label}
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
>((ownProps, clustersLoading, lastUpdated, clustersError, clustersData) => {
  const thisCluster = clustersData.find(
    c => +c.id === +ownProps.match.params.clusterID
  );
  const cluster = thisCluster
    ? extendCluster(thisCluster, ownProps.typesData || [])
    : null;
  return {
    ...ownProps,
    cluster,
    lastUpdated,
    clustersLoading,
    clustersLoadError: clustersError.read,
    clusterDeleteError: clustersError.delete
  };
});

const enhanced = compose<CombinedProps, {}>(
  styled,
  withTypes,
  withCluster,
  withRouter,
  withSnackbar
);

export default enhanced(KubernetesClusterDetail);
