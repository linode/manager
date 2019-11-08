import * as Bluebird from 'bluebird';
import { APIError } from 'linode-js-sdk/lib/types';
import { contains, equals, path, remove, update } from 'ramda';
import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import Grid from 'src/components/core/Grid';
import { DispatchProps } from 'src/containers/kubernetes.container';
import { WithTypesProps } from 'src/containers/types.container';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import scrollTo from 'src/utilities/scrollTo';
import { getMonthlyPrice } from '.././kubeUtils';
import { ExtendedCluster, PoolNodeWithPrice } from '.././types';
import NodePoolPanel from '../CreateCluster/NodePoolPanel';
import NodePoolsDisplay from './NodePoolsDisplay';

interface Props {
  cluster: ExtendedCluster;
  nodePoolsLoading: boolean;
}

export type ResizeProps = Props &
  DispatchProps &
  WithTypesProps &
  RouteComponentProps<{}>;

export const ResizeCluster: React.FC<ResizeProps> = props => {
  const {
    cluster,
    typesData,
    typesError,
    typesLoading,
    nodePoolsLoading
  } = props;

  if (!cluster) {
    return null;
  }

  /** Holds the local state of the cluster's node pools when editing */
  const [pools, updatePools] = React.useState<PoolNodeWithPrice[]>(
    cluster.node_pools || []
  );
  /** When adding new pools in the NodePoolPanel component, use these variables. */
  const [selectedType, setSelectedType] = React.useState<string | undefined>(
    undefined
  );
  const [count, setCount] = React.useState<number>(1);
  /** Form submission */
  const [submitting, setSubmitting] = React.useState<boolean>(false);
  const [generalError, setErrors] = React.useState<APIError[] | undefined>(
    undefined
  );
  const [success, setSuccess] = React.useState<boolean>(false);

  const [submitDisabled, setSubmitDisabled] = React.useState<boolean>(true);

  React.useEffect(() => {
    if (!equals(pools, cluster.node_pools)) {
      setSubmitDisabled(false);
    } else {
      setSubmitDisabled(true);
    }
  }, [pools, cluster.node_pools]);
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
        setSubmitDisabled(true);
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

  const handleAddNodePool = (pool: PoolNodeWithPrice) => {
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

  const resetFormState = () => {
    updatePools(cluster.node_pools);
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

  return (
    <>
      <Grid item xs={12}>
        <NodePoolsDisplay
          submittingForm={submitting}
          submitForm={submitForm}
          submissionSuccess={success}
          submissionError={generalError}
          submitDisabled={submitDisabled}
          editing={true}
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
    </>
  );
};

export default ResizeCluster;
