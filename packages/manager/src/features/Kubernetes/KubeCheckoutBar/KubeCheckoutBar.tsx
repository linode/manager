import * as React from 'react';
import CheckoutBar from 'src/components/CheckoutBar';
import renderGuard from 'src/components/RenderGuard';
import { ExtendedType } from 'src/store/linodeType/linodeType.reducer';
import { getTotalClusterPrice } from '../kubeUtils';
import { PoolNodeWithPrice } from '../types';
import NodePoolSummary from './NodePoolSummary';
import KubeNodeWarning from '../KubeNodeWarning';

export interface Props {
  pools: PoolNodeWithPrice[];
  submitting: boolean;
  typesData: ExtendedType[];
  createCluster: () => void;
  updatePool: (poolIdx: number, updatedPool: PoolNodeWithPrice) => void;
  removePool: (poolIdx: number) => void;
}

export const KubeCheckoutBar: React.FC<Props> = (props) => {
  const {
    pools,
    submitting,
    createCluster,
    removePool,
    typesData,
    updatePool,
  } = props;

  // Show a warning if any of the pools have fewer than 3 nodes
  const showWarning = pools.some((thisPool) => thisPool.count < 3);

  return (
    <CheckoutBar
      data-qa-checkout-bar
      heading="Cluster Summary"
      calculatedPrice={getTotalClusterPrice(pools)}
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
        {showWarning && <KubeNodeWarning spacingTop={16} />}
      </>
    </CheckoutBar>
  );
};

export default renderGuard(KubeCheckoutBar);
