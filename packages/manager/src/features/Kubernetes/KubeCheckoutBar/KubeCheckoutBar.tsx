import { KubeNodePoolResponse } from '@linode/api-v4';
import * as React from 'react';

import { CheckoutBar } from 'src/components/CheckoutBar/CheckoutBar';
import { CircleProgress } from 'src/components/CircleProgress';
import { Divider } from 'src/components/Divider';
import { Notice } from 'src/components/Notice/Notice';
import { RenderGuard } from 'src/components/RenderGuard';
import EUAgreementCheckbox from 'src/features/Account/Agreements/EUAgreementCheckbox';
import { getMonthlyPrice } from 'src/features/Kubernetes/kubeUtils';
import { useAccountAgreements } from 'src/queries/accountAgreements';
import { useProfile } from 'src/queries/profile';
import { useSpecificTypes } from 'src/queries/types';
import { extendTypesQueryResult } from 'src/utilities/extendType';
import { isEURegion } from 'src/utilities/formatRegion';

import { getTotalClusterPrice, nodeWarning } from '../kubeUtils';
import NodePoolSummary from './NodePoolSummary';
import { Typography } from '@mui/material';

export interface Props {
  createCluster: () => void;
  hasAgreed: boolean;
  highAvailability?: boolean;
  highAvailabilityPrice: number | undefined;
  pools: KubeNodePoolResponse[];
  region: string | undefined;
  removePool: (poolIdx: number) => void;
  showHighAvailability: boolean | undefined;
  submitting: boolean;
  toggleHasAgreed: () => void;
  updatePool: (poolIdx: number, updatedPool: KubeNodePoolResponse) => void;
}

export const KubeCheckoutBar: React.FC<Props> = (props) => {
  const {
    createCluster,
    hasAgreed,
    highAvailability,
    highAvailabilityPrice,
    pools,
    region,
    removePool,
    showHighAvailability,
    submitting,
    toggleHasAgreed,
    updatePool,
  } = props;

  // Show a warning if any of the pools have fewer than 3 nodes
  const showWarning = pools.some((thisPool) => thisPool.count < 3);

  const { data: profile } = useProfile();
  const { data: agreements } = useAccountAgreements();
  const typesQuery = useSpecificTypes(pools.map((pool) => pool.type));
  const types = extendTypesQueryResult(typesQuery);
  const isLoading = typesQuery.some((query) => query.isLoading);

  const showGDPRCheckbox =
    isEURegion(region) &&
    !profile?.restricted &&
    agreements?.eu_model === false;

  const needsAPool = pools.length < 1;

  const gdprConditions = !hasAgreed && showGDPRCheckbox;

  const haConditions =
    highAvailability === undefined &&
    showHighAvailability &&
    highAvailabilityPrice !== undefined;

  const disableCheckout = Boolean(needsAPool || gdprConditions || haConditions);

  if (isLoading) {
    return <CircleProgress />;
  }

  if (region === '') {
    return (
      <>
        <Typography variant="h2">Cluster Summary</Typography>
        <Divider dark spacingBottom={1} spacingTop={16} />
        <Typography sx={{ padding: `12px 0` }}>
          Select a Region to view summary and create a cluster.
        </Typography>
      </>
    );
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
        highAvailability ? highAvailabilityPrice : undefined
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
        <Divider dark spacingBottom={0} spacingTop={16} />
        {showWarning && (
          <Notice important spacingTop={16} text={nodeWarning} warning />
        )}
      </>
    </CheckoutBar>
  );
};

export default RenderGuard(KubeCheckoutBar);
