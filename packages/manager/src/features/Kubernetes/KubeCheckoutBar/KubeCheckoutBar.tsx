import * as React from 'react';
import { Sticky, StickyProps } from 'react-sticky';

import CheckoutBar from 'src/components/CheckoutBar';
import renderGuard from 'src/components/RenderGuard';
import { ExtendedType } from 'src/features/linodes/LinodesCreate/SelectPlanPanel';
import { getTotalClusterPrice } from '../kubeUtils';
import { PoolNodeWithPrice } from '../types';
import NodePoolSummary from './NodePoolSummary';

interface Props {
  pools: PoolNodeWithPrice[];
  submitting: boolean;
  typesData: ExtendedType[];
  createCluster: () => void;
  updatePool: (poolIdx: number, updatedPool: PoolNodeWithPrice) => void;
  removePool: (poolIdx: number) => void;
}

export const KubeCheckoutBar: React.FunctionComponent<Props> = props => {
  const {
    pools,
    submitting,
    createCluster,
    removePool,
    typesData,
    updatePool
  } = props;

  return (
    <Sticky topOffset={-24} disableCompensation>
      {(stickyProps: StickyProps) => {
        return (
          <div>
            <CheckoutBar
              data-qa-checkout-bar
              heading="Cluster Summary"
              calculatedPrice={getTotalClusterPrice(pools)}
              isMakingRequest={submitting}
              disabled={false}
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
                      typesData.find(
                        thisType => thisType.id === thisPool.type
                      ) || null
                    }
                  />
                ))}
              </>
            </CheckoutBar>
          </div>
        );
      }}
    </Sticky>
  );
};

export default renderGuard(KubeCheckoutBar);
