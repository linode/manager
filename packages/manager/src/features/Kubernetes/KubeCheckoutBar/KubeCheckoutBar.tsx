import * as React from 'react';
import CheckoutBar from 'src/components/CheckoutBar';
import Divider from 'src/components/core/Divider';
import Notice from 'src/components/Notice';
import renderGuard from 'src/components/RenderGuard';
import {
  getHAPrice,
  useAllKubernetesTypesQuery,
} from 'src/queries/kubernetesTypes';
import { ExtendedType } from 'src/store/linodeType/linodeType.reducer';
import { getTotalClusterPrice, nodeWarning } from '../kubeUtils';
import { PoolNodeWithPrice } from '../types';
import HACheckbox from './HACheckbox';
import NodePoolSummary from './NodePoolSummary';

export interface Props {
  pools: PoolNodeWithPrice[];
  submitting: boolean;
  typesData: ExtendedType[];
  createCluster: () => void;
  updatePool: (poolIdx: number, updatedPool: PoolNodeWithPrice) => void;
  removePool: (poolIdx: number) => void;
  highAvailability: boolean;
  setHighAvailability: (ha: boolean) => void;
}

export const KubeCheckoutBar: React.FC<Props> = (props) => {
  const {
    pools,
    submitting,
    createCluster,
    removePool,
    typesData,
    updatePool,
    highAvailability,
    setHighAvailability,
  } = props;

  const { data: kubernetesTypes } = useAllKubernetesTypesQuery();

  const haPrice = getHAPrice(kubernetesTypes)?.monthly;

  // Show a warning if any of the pools have fewer than 3 nodes
  const showWarning = pools.some((thisPool) => thisPool.count < 3);

  return (
    <CheckoutBar
      data-qa-checkout-bar
      heading="Cluster Summary"
      calculatedPrice={getTotalClusterPrice(
        pools,
        highAvailability ? haPrice : undefined
      )}
      isMakingRequest={submitting}
      disabled={pools.length < 1}
      onDeploy={createCluster}
      submitText={'Create Cluster'}
    >
      <>
        {pools.map((thisPool, idx) => (
          <NodePoolSummary
            key={idx}
            nodeCount={thisPool.count}
            updateNodeCount={(updatedCount: number) =>
              updatePool(idx, { ...thisPool, count: updatedCount })
            }
            onRemove={() => removePool(idx)}
            price={thisPool.totalMonthlyPrice}
            poolType={
              typesData.find((thisType) => thisType.id === thisPool.type) ||
              null
            }
          />
        ))}
        <Divider spacingTop={16} />
        <HACheckbox
          checked={highAvailability}
          onChange={(e) => setHighAvailability(e.target.checked)}
          haPrice={haPrice || 0}
        />
        <Divider spacingTop={16} />
        {showWarning && (
          <Notice warning important text={nodeWarning} spacingTop={16} />
        )}
      </>
    </CheckoutBar>
  );
};

export default renderGuard(KubeCheckoutBar);
