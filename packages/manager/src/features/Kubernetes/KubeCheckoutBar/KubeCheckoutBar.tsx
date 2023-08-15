import { KubeNodePoolResponse } from '@linode/api-v4';
import * as React from 'react';

import { CheckoutBar } from 'src/components/CheckoutBar/CheckoutBar';
import { CircleProgress } from 'src/components/CircleProgress';
import { Divider } from 'src/components/Divider';
import { Notice } from 'src/components/Notice/Notice';
import { RenderGuard } from 'src/components/RenderGuard';
import EUAgreementCheckbox from 'src/features/Account/Agreements/EUAgreementCheckbox';
import {
  getKubeHighAvailability,
  getMonthlyPrice,
} from 'src/features/Kubernetes/kubeUtils';
import { useAccount } from 'src/queries/account';
import { useAccountAgreements } from 'src/queries/accountAgreements';
import { useProfile } from 'src/queries/profile';
import { useSpecificTypes } from 'src/queries/types';
import { extendTypesQueryResult } from 'src/utilities/extendType';
import { isEURegion } from 'src/utilities/formatRegion';

import { getTotalClusterPrice, nodeWarning } from '../kubeUtils';
import HACheckbox from './HACheckbox';
import NodePoolSummary from './NodePoolSummary';

export interface Props {
  createCluster: () => void;
  hasAgreed: boolean;
  highAvailability: boolean;
  pools: KubeNodePoolResponse[];
  region: string | undefined;
  removePool: (poolIdx: number) => void;
  setHighAvailability: (ha: boolean) => void;
  submitting: boolean;
  toggleHasAgreed: () => void;
  updatePool: (poolIdx: number, updatedPool: KubeNodePoolResponse) => void;
}

export const KubeCheckoutBar: React.FC<Props> = (props) => {
  const {
    createCluster,
    hasAgreed,
    highAvailability,
    pools,
    region,
    removePool,
    setHighAvailability,
    submitting,
    toggleHasAgreed,
    updatePool,
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
      agreement={
        showGDPRCheckbox ? (
          <EUAgreementCheckbox checked={hasAgreed} onChange={toggleHasAgreed} />
        ) : undefined
      }
      calculatedPrice={getTotalClusterPrice(
        pools,
        types ?? [],
        highAvailability
      )}
      data-qa-checkout-bar
      disabled={disableCheckout}
      heading="Cluster Summary"
      isMakingRequest={submitting}
      onDeploy={createCluster}
      submitText="Create Cluster"
    >
      <>
        {pools.map((thisPool, idx) => (
          <NodePoolSummary
            poolType={
              types?.find((thisType) => thisType.id === thisPool.type) || null
            }
            updateNodeCount={(updatedCount: number) =>
              updatePool(idx, { ...thisPool, count: updatedCount })
            }
            key={idx}
            nodeCount={thisPool.count}
            onRemove={() => removePool(idx)}
            price={getMonthlyPrice(thisPool.type, thisPool.count, types ?? [])}
          />
        ))}
        {showHighAvailability ? (
          <>
            <Divider dark spacingBottom={12} spacingTop={16} />
            <HACheckbox
              checked={highAvailability}
              onChange={(e) => setHighAvailability(e.target.checked)}
            />
            <Divider dark spacingBottom={0} spacingTop={16} />
          </>
        ) : null}
        {showWarning && (
          <Notice
            important
            spacingTop={16}
            variant="warning"
            text={nodeWarning}
          />
        )}
      </>
    </CheckoutBar>
  );
};

export default RenderGuard(KubeCheckoutBar);
