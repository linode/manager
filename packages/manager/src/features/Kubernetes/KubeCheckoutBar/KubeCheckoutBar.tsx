import {
  useAccountAgreements,
  useProfile,
  useSpecificTypes,
} from '@linode/queries';
import { CircleProgress, Divider, Notice, Typography } from '@linode/ui';
import * as React from 'react';

import { CheckoutBar } from 'src/components/CheckoutBar/CheckoutBar';
import { Link } from 'src/components/Link';
import { RenderGuard } from 'src/components/RenderGuard';
import { EUAgreementCheckbox } from 'src/features/Account/Agreements/EUAgreementCheckbox';
import { extendTypesQueryResult } from 'src/utilities/extendType';
import { getGDPRDetails } from 'src/utilities/formatRegion';
import {
  LKE_ADDITIONAL_PRICING,
  LKE_CREATE_CLUSTER_CHECKOUT_MESSAGE,
  LKE_ENTERPRISE_CREATE_CLUSTER_CHECKOUT_MESSAGE,
} from 'src/utilities/pricing/constants';
import {
  getKubernetesMonthlyPrice,
  getTotalClusterPrice,
} from 'src/utilities/pricing/kubernetes';

import { nodeWarning } from '../constants';
import { StyledBox, StyledHeader } from './KubeCheckoutSummary.styles';
import { NodePoolSummaryItem } from './NodePoolSummaryItem';

import type { KubeNodePoolResponse, Region } from '@linode/api-v4';

export interface Props {
  createCluster: () => void;
  enterprisePrice?: number;
  hasAgreed: boolean;
  highAvailability?: boolean;
  highAvailabilityPrice: string;
  pools: KubeNodePoolResponse[];
  region: string | undefined;
  regionsData: Region[];
  removePool: (poolIdx: number) => void;
  showHighAvailability: boolean | undefined;
  submitting: boolean;
  toggleHasAgreed: () => void;
  updatePool: (poolIdx: number, updatedPool: KubeNodePoolResponse) => void;
}

export const KubeCheckoutBar = (props: Props) => {
  const {
    createCluster,
    enterprisePrice,
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
    needsAPool ||
      gdprConditions ||
      (haConditions && !enterprisePrice) ||
      !region
  );

  if (isLoading) {
    return <CircleProgress />;
  }

  return (
    <CheckoutBar
      additionalPricing={AdditionalPricing}
      agreement={
        showGDPRCheckbox ? (
          <EUAgreementCheckbox checked={hasAgreed} onChange={toggleHasAgreed} />
        ) : undefined
      }
      calculatedPrice={
        region
          ? getTotalClusterPrice({
              enterprisePrice: enterprisePrice ?? undefined,
              highAvailabilityPrice:
                highAvailability && !enterprisePrice
                  ? Number(highAvailabilityPrice)
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
      priceSelectionText={
        enterprisePrice
          ? LKE_ENTERPRISE_CREATE_CLUSTER_CHECKOUT_MESSAGE
          : LKE_CREATE_CLUSTER_CHECKOUT_MESSAGE
      }
      submitText="Create Cluster"
    >
      <>
        {region && highAvailability && !enterprisePrice && (
          <StyledBox>
            <Divider dark spacingBottom={16} spacingTop={16} />
            <StyledHeader>High Availability (HA) Control Plane</StyledHeader>
            <Typography>{`$${highAvailabilityPrice}/month`}</Typography>
          </StyledBox>
        )}
        {enterprisePrice && (
          <StyledBox>
            <Divider dark spacingBottom={16} spacingTop={16} />
            <StyledHeader>LKE Enterprise</StyledHeader>
            <Typography mt={1}>{`$${enterprisePrice?.toFixed(
              2
            )}/month`}</Typography>
          </StyledBox>
        )}
        {pools.map((thisPool, idx) => (
          <NodePoolSummaryItem
            clusterTier={enterprisePrice ? 'enterprise' : 'standard'}
            key={idx}
            nodeCount={thisPool.count}
            onRemove={() => removePool(idx)}
            poolType={
              types?.find((thisType) => thisType.id === thisPool.type) || null
            }
            price={
              region
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
          />
        ))}
        <Divider dark spacingBottom={0} spacingTop={16} />
        {showWarning && (
          <Notice spacingTop={16} text={nodeWarning} variant="warning" />
        )}
      </>
    </CheckoutBar>
  );
};

const AdditionalPricing = (
  <>
    <Divider dark spacingBottom={16} spacingTop={16} />
    <Typography>{LKE_ADDITIONAL_PRICING}</Typography>
    <Link
      data-testid="additional-pricing-link"
      to="https://www.linode.com/pricing/"
    >
      See pricing
    </Link>
    .
  </>
);

export default RenderGuard(KubeCheckoutBar);
