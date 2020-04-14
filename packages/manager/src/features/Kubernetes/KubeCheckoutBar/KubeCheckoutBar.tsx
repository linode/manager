import * as React from 'react';
import { Sticky, StickyProps } from 'react-sticky';
import CheckoutBar from 'src/components/CheckoutBar';
import Notice from 'src/components/Notice';
import renderGuard from 'src/components/RenderGuard';
import { ExtendedType } from 'src/features/linodes/LinodesCreate/SelectPlanPanel';
import { getTotalClusterPrice, nodeWarning } from '../kubeUtils';
import { PoolNodeWithPrice } from '../types';
import NodePoolSummary from './NodePoolSummary';

export interface Props {
  pools: PoolNodeWithPrice[];
  submitting: boolean;
  typesData: ExtendedType[];
  createCluster: () => void;
  updatePool: (poolIdx: number, updatedPool: PoolNodeWithPrice) => void;
  removePool: (poolIdx: number) => void;
}

export const KubeCheckoutBar: React.FC<Props> = props => {
  const {
    pools,
    submitting,
    createCluster,
    removePool,
    typesData,
    updatePool
  } = props;

  // Show a warning if any of the pools have fewer than 3 nodes
  const showWarning = pools.some(thisPool => thisPool.count < 3);

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
                {showWarning && (
                  <Notice
                    warning
                    important
                    text={nodeWarning}
                    spacingTop={16}
                  />
                )}
              </>
            </CheckoutBar>
          </div>
        );
      }}
    </Sticky>
  );
};

export default renderGuard(KubeCheckoutBar);
