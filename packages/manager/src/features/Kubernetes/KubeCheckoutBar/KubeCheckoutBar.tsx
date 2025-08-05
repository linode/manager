import {
  useAccountAgreements,
  useProfile,
  useSpecificTypes,
} from '@linode/queries';
import {
  Box,
  CircleProgress,
  Divider,
  Notice,
  Stack,
  Typography,
} from '@linode/ui';
import * as React from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';

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
import { NodePoolSummaryItem } from './NodePoolSummaryItem';

import type { NodePoolConfigDrawerHandlerParams } from '../CreateCluster/CreateCluster';
import type { CreateNodePoolData, Region } from '@linode/api-v4';

export interface Props {
  createCluster: () => void;
  enterprisePrice?: number;
  handleConfigurePool?: (params: NodePoolConfigDrawerHandlerParams) => void;
  hasAgreed: boolean;
  highAvailability?: boolean;
  highAvailabilityPrice: string;
  pools: CreateNodePoolData[];
  region: string | undefined;
  regionsData: Region[];
  submitting: boolean;
  toggleHasAgreed: () => void;
}

export const KubeCheckoutBar = (props: Props) => {
  const {
    createCluster,
    enterprisePrice,
    handleConfigurePool,
    hasAgreed,
    highAvailability,
    highAvailabilityPrice,
    pools,
    region,
    regionsData,
    submitting,
    toggleHasAgreed,
  } = props;

  const { control } = useFormContext();
  const { update, remove } = useFieldArray({
    control,
    name: 'nodePools',
  });

  // Show a warning if any of the pools have fewer than 3 nodes
  const showWarning = pools?.some((thisPool) => thisPool.count < 3);

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
    highAvailability === undefined && highAvailabilityPrice !== undefined;

  const disableCheckout = Boolean(
    needsAPool ||
      gdprConditions ||
      (haConditions && !enterprisePrice) ||
      !region
  );

  if (isLoading) {
    return <CircleProgress />;
  }

  const price = region
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
    : undefined;

  return (
    <CheckoutBar
      agreement={
        showGDPRCheckbox ? (
          <EUAgreementCheckbox checked={hasAgreed} onChange={toggleHasAgreed} />
        ) : undefined
      }
      calculatedPrice={price}
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
      <Stack divider={<Divider />} mt={2} spacing={2}>
        {region && highAvailability && !enterprisePrice && (
          <Stack spacing={1}>
            <Typography variant="h3">
              High Availability (HA) Control Plane
            </Typography>
            <Typography>{`$${highAvailabilityPrice}/month`}</Typography>
          </Stack>
        )}
        {enterprisePrice && (
          <Stack spacing={1}>
            <Typography variant="h3">LKE Enterprise</Typography>
            <Typography>{`$${enterprisePrice?.toFixed(2)}/month`}</Typography>
          </Stack>
        )}
        {pools.map((thisPool, idx) => (
          <NodePoolSummaryItem
            clusterTier={enterprisePrice ? 'enterprise' : 'standard'}
            handleConfigurePool={handleConfigurePool}
            key={idx}
            nodeCount={thisPool.count}
            onRemove={() => remove(idx)}
            poolIndex={idx}
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
              update(idx, { ...thisPool, count: updatedCount })
            }
          />
        ))}
        {showWarning && (
          <Notice spacingTop={16} text={nodeWarning} variant="warning" />
        )}
        {price && price >= 0 && (
          <Box>
            <Typography>{LKE_ADDITIONAL_PRICING}</Typography>
            <Link
              data-testid="additional-pricing-link"
              to="https://www.linode.com/pricing/"
            >
              See pricing
            </Link>
            .
            <Divider spacingBottom={0} spacingTop={16} />
          </Box>
        )}
      </Stack>
    </CheckoutBar>
  );
};

export default RenderGuard(KubeCheckoutBar);
