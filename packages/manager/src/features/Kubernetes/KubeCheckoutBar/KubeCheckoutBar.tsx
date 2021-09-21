import * as React from 'react';
import CheckoutBar from 'src/components/CheckoutBar';
import Divider from 'src/components/core/Divider';
import Notice from 'src/components/Notice';
import renderGuard from 'src/components/RenderGuard';
import useFlags from 'src/hooks/useFlags';
import { ExtendedType } from 'src/store/linodeType/linodeType.reducer';
import { getTotalClusterPrice, nodeWarning } from '../kubeUtils';
import { PoolNodeWithPrice } from '../types';
import HACheckbox from './HACheckbox';
import NodePoolSummary from './NodePoolSummary';
import {
  getHAPrice,
  useAllKubernetesTypesQuery,
} from 'src/queries/kubernetesTypes';

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

  const flags = useFlags();

  const { data: kubernetesTypes } = useAllKubernetesTypesQuery(
    flags.lkeHighAvailability
  );

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
        {flags.lkeHighAvailability && haPrice ? (
          <>
            <Divider spacingTop={16} />
            <HACheckbox
              checked={highAvailability}
              onChange={(e) => setHighAvailability(e.target.checked)}
              haPrice={haPrice}
            />
            <Divider spacingTop={16} />
          </>
        ) : null}
        {showWarning && (
          <Notice warning important text={nodeWarning} spacingTop={16} />
        )}
      </>
    </CheckoutBar>
  );
};

export default renderGuard(KubeCheckoutBar);
