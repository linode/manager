import { CircleProgress, Divider, Notice, Typography } from '@linode/ui';
import * as React from 'react';

import { CheckoutBar } from 'src/components/CheckoutBar/CheckoutBar';
import { Link } from 'src/components/Link';
import { RenderGuard } from 'src/components/RenderGuard';
import { EUAgreementCheckbox } from 'src/features/Account/Agreements/EUAgreementCheckbox';
import { useAccountAgreements, useProfile } from '@linode/queries';
import { useSpecificTypes } from 'src/queries/types';
import { extendTypesQueryResult } from 'src/utilities/extendType';
import { getGDPRDetails } from 'src/utilities/formatRegion';
import {
  LKE_CREATE_CLUSTER_CHECKOUT_MESSAGE,
  LKE_ENTERPRISE_CREATE_CLUSTER_CHECKOUT_MESSAGE,
  LKE_ADDITIONAL_PRICING,
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
  pools: KubeNodePoolResponse[] | undefined;
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

  const showWarning = pools?.some((thisPool) => thisPool.count < 3) ?? false;

  const { data: profile } = useProfile();
  const { data: agreements } = useAccountAgreements();
  const safePools = pools ?? [];
  const typesQuery = useSpecificTypes(safePools.map((pool) => pool.type));
  const types = extendTypesQueryResult(typesQuery);
  const isLoading = typesQuery.some((query) => query.isLoading);

  const { showGDPRCheckbox } = getGDPRDetails({
    agreements,
    profile,
    regions: regionsData,
    selectedRegionId: region,
  });

  const needsAPool = pools && pools.length < 1;

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
      agreement={
        showGDPRCheckbox ? (
          <EUAgreementCheckbox checked={hasAgreed} onChange={toggleHasAgreed} />
        ) : undefined
      }
      calculatedPrice={
        region
          ? pools &&
            getTotalClusterPrice({
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
      priceSelectionText={
        enterprisePrice
          ? LKE_ENTERPRISE_CREATE_CLUSTER_CHECKOUT_MESSAGE
          : LKE_CREATE_CLUSTER_CHECKOUT_MESSAGE
      }
      additionalPricing={AdditionalPricing}
      data-qa-checkout-bar
      disabled={disableCheckout}
      heading="Cluster Summary"
      isMakingRequest={submitting}
      onDeploy={createCluster}
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
        {pools &&
          pools.map((thisPool, idx) => (
            <NodePoolSummaryItem
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
