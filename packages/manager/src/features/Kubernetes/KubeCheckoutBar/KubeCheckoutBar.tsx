import { KubeNodePoolResponse, Region } from '@linode/api-v4';
import { Typography, styled } from '@mui/material';
import * as React from 'react';

import { Box } from 'src/components/Box';
import { CheckoutBar } from 'src/components/CheckoutBar/CheckoutBar';
import { CircleProgress } from 'src/components/CircleProgress';
import { displayPrice } from 'src/components/DisplayPrice';
import { Divider } from 'src/components/Divider';
import { Notice } from 'src/components/Notice/Notice';
import { RenderGuard } from 'src/components/RenderGuard';
import { EUAgreementCheckbox } from 'src/features/Account/Agreements/EUAgreementCheckbox';
import { useAccountAgreements } from 'src/queries/accountAgreements';
import { useProfile } from 'src/queries/profile';
import { useSpecificTypes } from 'src/queries/types';
import { extendTypesQueryResult } from 'src/utilities/extendType';
import { getGDPRDetails } from 'src/utilities/formatRegion';
import { LKE_CREATE_CLUSTER_CHECKOUT_MESSAGE } from 'src/utilities/pricing/constants';
import {
  getKubernetesMonthlyPrice,
  getTotalClusterPrice,
} from 'src/utilities/pricing/kubernetes';

import { nodeWarning } from '../kubeUtils';
import NodePoolSummary from './NodePoolSummary';

export interface Props {
  createCluster: () => void;
  hasAgreed: boolean;
  highAvailability?: boolean;
  highAvailabilityPrice: number | undefined;
  pools: KubeNodePoolResponse[];
  region: string;
  regionsData: Region[];
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
    regionsData,
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

  const { showGDPRCheckbox } = getGDPRDetails({
    agreements,
    profile,
    regions: regionsData,
    selectedRegionId: region,
  });

  const needsAPool = pools.length < 1;

  const gdprConditions = !hasAgreed && showGDPRCheckbox;

  const haConditions =
    highAvailability === undefined &&
    showHighAvailability &&
    highAvailabilityPrice !== undefined;

  const disableCheckout = Boolean(
    needsAPool || gdprConditions || haConditions || region === ''
  );

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
      calculatedPrice={
        region !== ''
          ? getTotalClusterPrice({
              highAvailabilityPrice: highAvailability
                ? highAvailabilityPrice
                : undefined,
              pools,
              region,
              types: types ?? [],
            })
          : undefined
      }
      data-qa-checkout-bar
      disabled={disableCheckout}
      heading="Cluster Summary"
      isMakingRequest={submitting}
      onDeploy={createCluster}
      priceSelectionText={LKE_CREATE_CLUSTER_CHECKOUT_MESSAGE}
      submitText="Create Cluster"
    >
      <>
        {pools.map((thisPool, idx) => (
          <NodePoolSummary
            poolType={
              types?.find((thisType) => thisType.id === thisPool.type) || null
            }
            price={
              region !== ''
                ? getKubernetesMonthlyPrice({
                    count: thisPool.count,
                    region,
                    type: thisPool.type,
                    types: types ?? [],
                  })
                : undefined
            }
            updateNodeCount={(updatedCount: number) =>
              updatePool(idx, { ...thisPool, count: updatedCount })
            }
            key={idx}
            nodeCount={thisPool.count}
            onRemove={() => removePool(idx)}
          />
        ))}
        <Divider dark spacingBottom={0} spacingTop={16} />
        {showWarning && (
          <Notice
            important
            spacingTop={16}
            text={nodeWarning}
            variant="warning"
          />
        )}
        {region != '' && highAvailability ? (
          <StyledHABox>
            <StyledHAHeader>
              High Availability (HA) Control Plane
            </StyledHAHeader>
            <Typography>
              {displayPrice(Number(highAvailabilityPrice))}/month
            </Typography>
            <Divider dark spacingBottom={0} spacingTop={16} />
          </StyledHABox>
        ) : undefined}
      </>
    </CheckoutBar>
  );
};

export default RenderGuard(KubeCheckoutBar);

const StyledHAHeader = styled(Typography, {
  label: 'StyledHAHeader',
})(({ theme }) => ({
  fontFamily: theme.font.bold,
  fontSize: '16px',
  paddingBottom: theme.spacing(0.5),
  paddingTop: theme.spacing(0.5),
}));

const StyledHABox = styled(Box, {
  label: 'StyledHABox',
})(({ theme }) => ({
  marginTop: theme.spacing(2),
}));
