import * as React from 'react';
import CheckoutBar from 'src/components/CheckoutBar';
import Notice from 'src/components/Notice';
import renderGuard from 'src/components/RenderGuard';
import EUAgreementCheckbox from 'src/features/Account/Agreements/EUAgreementCheckbox';
import { ExtendedType } from 'src/store/linodeType/linodeType.reducer';
import { isEURegion } from 'src/utilities/formatRegion';
import { getTotalClusterPrice, nodeWarning } from '../kubeUtils';
import { PoolNodeWithPrice } from '../types';
import NodePoolSummary from './NodePoolSummary';
import useAccountManagement from 'src/hooks/useAccountManagement';
// import { signAgreement } from '';

export interface Props {
  pools: PoolNodeWithPrice[];
  submitting: boolean;
  typesData: ExtendedType[];
  createCluster: () => void;
  updatePool: (poolIdx: number, updatedPool: PoolNodeWithPrice) => void;
  removePool: (poolIdx: number) => void;
  region: string | undefined;
}

type SetAgreed = (hasAgreed: boolean) => void;

const toggleAgreed = (hasAgreed: boolean, setAgreed: SetAgreed) => {
  setAgreed(!hasAgreed);
}

export const KubeCheckoutBar: React.FC<Props> = (props) => {
  const {
    pools,
    submitting,
    createCluster,
    removePool,
    typesData,
    updatePool,
    region,
  } = props;

  // Show a warning if any of the pools have fewer than 3 nodes
  const showWarning = pools.some((thisPool) => thisPool.count < 3);

  const { _isRestrictedUser: isRestrictedUser } = useAccountManagement();

  const [hasAgreed, setAgreed] = React.useState(false);

  return (
    <CheckoutBar
      data-qa-checkout-bar
      heading="Cluster Summary"
      calculatedPrice={getTotalClusterPrice(pools)}
      isMakingRequest={submitting}
      disabled={pools.length < 1}
      onDeploy={createCluster}
      submitText={'Create Cluster'}
      agreement={
        isEURegion(region) && !isRestrictedUser ? (
          <EUAgreementCheckbox checked={hasAgreed} onChange={() => {toggleAgreed(hasAgreed, setAgreed)}} />
        ) : undefined
      }
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
        {showWarning && (
          <Notice warning important text={nodeWarning} spacingTop={16} />
        )}
      </>
    </CheckoutBar>
  );
};

export default renderGuard(KubeCheckoutBar);
