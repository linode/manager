import { KubeNodePoolResponse } from '@linode/api-v4';
import * as React from 'react';
import CheckoutBar from 'src/components/CheckoutBar';
import CircleProgress from 'src/components/CircleProgress';
import Divider from 'src/components/core/Divider';
import Notice from 'src/components/Notice';
import renderGuard from 'src/components/RenderGuard';
import EUAgreementCheckbox from 'src/features/Account/Agreements/EUAgreementCheckbox';
import {
  getKubeHighAvailability,
  getMonthlyPrice,
} from 'src/features/Kubernetes/kubeUtils';
import { useAccount } from 'src/queries/account';
import { useAccountAgreements } from 'src/queries/accountAgreements';
import { useProfile } from 'src/queries/profile';
import { useSpecificTypes } from 'src/queries/types';
import { isEURegion } from 'src/utilities/formatRegion';
import { getTotalClusterPrice, nodeWarning } from '../kubeUtils';
import HACheckbox from './HACheckbox';
import NodePoolSummary from './NodePoolSummary';
import { extendTypesQueryResult } from 'src/utilities/extendType';

export interface Props {
  pools: KubeNodePoolResponse[];
  submitting: boolean;
  createCluster: () => void;
  updatePool: (poolIdx: number, updatedPool: KubeNodePoolResponse) => void;
  removePool: (poolIdx: number) => void;
  highAvailability: boolean;
  setHighAvailability: (ha: boolean) => void;
  region: string | undefined;
  hasAgreed: boolean;
  toggleHasAgreed: () => void;
}

export const KubeCheckoutBar: React.FC<Props> = (props) => {
  const {
    pools,
    submitting,
    createCluster,
    removePool,
    updatePool,
    highAvailability,
    setHighAvailability,
    region,
    hasAgreed,
    toggleHasAgreed,
  } = props;

  // Show a warning if any of the pools have fewer than 3 nodes
  const showWarning = pools.some((thisPool) => thisPool.count < 3);

  const { data: profile } = useProfile();
  const { data: account } = useAccount();
  const { data: agreements } = useAccountAgreements();
  const typesQuery = useSpecificTypes(pools.map((pool) => pool.type));
  const types = extendTypesQueryResult(typesQuery);
  const isLoading = typesQuery.some((query) => query.isLoading);

  const showGDPRCheckbox =
    isEURegion(region) &&
    !profile?.restricted &&
    agreements?.eu_model === false;

  const needsAPool = pools.length < 1;
  const disableCheckout = Boolean(
    needsAPool || (!hasAgreed && showGDPRCheckbox)
  );
  const { showHighAvailability } = getKubeHighAvailability(account);

  if (isLoading) {
    return <CircleProgress />;
  }

  return (
    <CheckoutBar
      data-qa-checkout-bar
      heading="Cluster Summary"
      calculatedPrice={getTotalClusterPrice(
        pools,
        types ?? [],
        highAvailability
      )}
      isMakingRequest={submitting}
      disabled={disableCheckout}
      onDeploy={createCluster}
      submitText="Create Cluster"
      agreement={
        showGDPRCheckbox ? (
          <EUAgreementCheckbox checked={hasAgreed} onChange={toggleHasAgreed} />
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
            price={getMonthlyPrice(thisPool.type, thisPool.count, types ?? [])}
            poolType={
              types?.find((thisType) => thisType.id === thisPool.type) || null
            }
          />
        ))}
        {showHighAvailability ? (
          <>
            <Divider dark spacingTop={16} spacingBottom={12} />
            <HACheckbox
              checked={highAvailability}
              onChange={(e) => setHighAvailability(e.target.checked)}
            />
            <Divider dark spacingTop={16} spacingBottom={0} />
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
