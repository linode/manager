import * as Bluebird from 'bluebird';
import { APIError } from 'linode-js-sdk/lib/types';
import { contains, equals, path, pathOr, remove, update } from 'ramda';
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

import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import scrollTo from 'src/utilities/scrollTo';
import { getMonthlyPrice } from '.././kubeUtils';
import { ExtendedCluster, PoolNodeWithPrice } from '.././types';
import NodePoolPanel from '../CreateCluster/NodePoolPanel';
import KubeConfigPanel from './KubeConfigPanel';
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
  | 'button'
  | 'tagSectionInner'
  | 'deleteSection'
  | 'titleGridWrapper'
  | 'tagHeading'
  | 'sectionMain'
  | 'sectionSideBar'
  | 'tagSection';

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
    tagSectionInner: {
      padding: `${theme.spacing(2) + 3}px ${theme.spacing(3)}px ${theme.spacing(
        1
      ) - 1}px`
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
    },
    tagSection: {
      [theme.breakpoints.down('sm')]: {
        order: 3
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
    nodePoolsLoading,
    typesData,
    typesError,
    typesLoading
  } = props;

  const [editing, setEditing] = React.useState<boolean>(false);
  /** Holds the local state of the cluster's node pools when editing */
  const [pools, updatePools] = React.useState<PoolNodeWithPrice[]>([]);
  /** When adding new pools in the NodePoolPanel component, use these variables. */
  const [selectedType, setSelectedType] = React.useState<string | undefined>(
    undefined
  );
  const [count, setCount] = React.useState<number>(1);
  /** For adding tags */
  const [tags, updateTags] = React.useState<string[]>([]);
  /** Form submission */
  const [submitting, setSubmitting] = React.useState<boolean>(false);
  const [generalError, setErrors] = React.useState<APIError[] | undefined>(
    undefined
  );
  const [success, setSuccess] = React.useState<boolean>(false);
  /** Deletion confirmation modal */
  const [confirmationOpen, setConfirmation] = React.useState<boolean>(false);
  const [deleting, setDeleting] = React.useState<boolean>(false);

  React.useEffect(() => {
    const clusterID = +props.match.params.clusterID;
    if (clusterID) {
      props.requestClusterForStore(clusterID);
    }

    /**
     * If we're navigating from the action menu on the cluster list page,
     * we want to start with editing mode active.
     */
    const isEditing = pathOr(
      false,
      ['history', 'location', 'state', 'editing'],
      props
    );

    if (isEditing !== editing) {
      toggleEditing();
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
    return <ErrorState errorText="Unable to load cluster data." />;
  }

  if (
    (clustersLoading && lastUpdated === 0) ||
    nodePoolsLoading ||
    typesLoading
  ) {
    return <CircleProgress />;
  }
  if (cluster === null) {
    return null;
  }

  /**
   * These three handlers update the local pools state in the event of an error. If an update
   * is fully successful, we'll exit editing mode, the table will show
   * the current Redux state of the cluster, and none of this will matter.
   *
   * If, however, some requests fail while others succeed, we want to show
   * error messages for actions that failed while updating the local form
   * state for actions that succeeded (so that e.g. a pending pool that has been added no longer has the
   * "pending pool" styles).
   */
  const handleError = (pool: PoolNodeWithPrice, error: APIError[]) => {
    const poolIdx = pools.findIndex(thisPool => thisPool.id === pool.id);
    updatePool(poolIdx, { ...pool, _error: error });
    return Promise.reject(error);
  };

  const handleAddSuccess = (pool: PoolNodeWithPrice) => {
    const poolIdx = pools.findIndex(thisPool => thisPool.id === pool.id);
    updatePool(poolIdx, {
      ...pool,
      queuedForAddition: false,
      queuedForDeletion: false
    });
  };

  const handleDeleteSuccess = (pool: PoolNodeWithPrice) => {
    const poolIdx = pools.findIndex(thisPool => thisPool.id === pool.id);
    if (poolIdx) {
      updatePools(prevPools => {
        return remove(poolIdx, 1, prevPools);
      });
    }
  };

  const submitForm = () => {
    /** If the user hasn't made any input, there's nothing to submit. */
    if (equals(pools, cluster.node_pools)) {
      setEditing(false);
      return;
    }
    /** Fasten your seat belts... */
    setSubmitting(true);
    setErrors(undefined);
    setSuccess(false);
    Bluebird.map(pools, thisPool => {
      if (thisPool.queuedForAddition) {
        // This pool doesn't exist and needs to be created through the API.
        return props
          .createNodePool({
            clusterID: cluster.id,
            count: thisPool.count,
            type: thisPool.type
          })
          .then(() => handleAddSuccess(thisPool))
          .catch(e => handleError(thisPool, e));
      } else if (thisPool.queuedForDeletion) {
        // Marked for deletion
        return props
          .deleteNodePool({
            clusterID: cluster.id,
            nodePoolID: thisPool.id
          })
          .then(() => handleDeleteSuccess(thisPool))
          .catch(e => handleError(thisPool, e));
      } else if (!contains(thisPool, cluster.node_pools)) {
        /** @todo contains() is deprecated in the next version of Ramda (0.26+). Replace with includes() if we ever upgrade. */

        // User has adjusted the count for this pool. Needs to be pushed through to the API.
        return props
          .updateNodePool({
            clusterID: cluster.id,
            nodePoolID: thisPool.id,
            count: thisPool.count,
            type: thisPool.type
          })
          .catch(e => handleError(thisPool, e));
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
      });
  };

  const updatePool = (poolIdx: number, updatedPool: PoolNodeWithPrice) => {
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

  const handleAddNodePool = (pool: PoolNodeWithPrice) => {
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
        scrollTo();
        return newPools;
      });
    } else {
      /** From a static state, adding a node pool should trigger editing state */
      scrollTo();
      toggleEditing();
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
      const poolToDelete = path<PoolNodeWithPrice>([poolIdx], prevPools);
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
           * (it will be handled on form submission). If the user has already marked this for deletion
           * and clicks on "Remove Delete", remove the queuedForDeletion tag.
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

  const handleUpdateTags = (newTags: string[]) => {
    return props
      .updateCluster({ clusterID: cluster.id, tags: newTags })
      .then(response => {
        updateTags(newTags);
        return response;
      });
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
            <KubeSummaryPanel cluster={cluster} />
          </Grid>
          <Grid item xs={12} className={classes.tagSection}>
            <Paper className={classes.tagSectionInner}>
              <Typography
                variant="h2"
                className={classes.tagHeading}
                data-qa-title
              >
                Cluster Tags
              </Typography>
              <div>
                <TagsPanel tags={tags} updateTags={handleUpdateTags} />
              </div>
            </Paper>
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
          <Grid item xs={12}>
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
          </Grid>
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
