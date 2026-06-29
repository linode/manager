import { Spacing } from '@akamai/cds-tokens';
import React from 'react';

import { useFlags } from 'src/hooks/useFlags';
import { useComputePricing } from 'src/utilities/pricing/useComputePricing';

import { StyledPlanSummarySpan } from '../DatabaseDetail/DatabaseResize/DatabaseResize.style';
import { useIsDatabasesEnabled } from '../utilities';
import { StyledSpan } from './DatabaseCreate.style';
import { getSuffix } from './utilities';

import type {
  ClusterSize,
  DatabaseClusterSizeObject,
  DatabasePriceObject,
  Engine,
  VPC,
} from '@linode/api-v4';
import type { PlanSelectionWithDatabaseType } from 'src/features/components/PlansPanel/types';

interface Props {
  currentClusterSize: ClusterSize;
  currentEngine: Engine;
  currentPlan: PlanSelectionWithDatabaseType | undefined;
  label?: string;
  mode: 'create' | 'resize';
  platform?: string;
  resizeData?: {
    basePrice: string;
    numberOfNodes: ClusterSize;
    plan: string;
    price: string;
  };
  selectedVPC?: null | VPC;
}

export const DatabaseSummarySection = (props: Props) => {
  const {
    currentClusterSize,
    currentEngine,
    currentPlan,
    selectedVPC,
    label,
    mode,
    platform,
    resizeData,
  } = props;
  const { isDatabasesV2GA } = useIsDatabasesEnabled();
  const flags = useFlags();
  const isVPCEnabled = flags.databaseVpc;
  const isResize = mode === 'resize';
  const isCreate = mode === 'create';
  const isVPCSelected = Boolean(selectedVPC);
  const displayVPC = isCreate && isVPCEnabled;

  const currentPrice = currentPlan?.engines[currentEngine]?.find(
    (cluster: DatabaseClusterSizeObject) =>
      cluster.quantity === currentClusterSize
  )?.price as DatabasePriceObject;

  const currentBasePrice = currentPlan?.engines[currentEngine]?.[0]
    .price as DatabasePriceObject;

  // Pricing scoped to the active billing interval from the `computePricing` LD flag.
  // Pass the plan id so `activeBillingPlanMatchers` can scope hourly billing to specific
  // plan classes (e.g. G8, GPU) without affecting others.
  const { formatPrice, priceLabel } = useComputePricing(currentPlan?.id);

  const currentNodePrice = `$${formatPrice(currentPrice)}/${priceLabel}`;
  const currentPlanPrice = `$${formatPrice(currentBasePrice)}/${priceLabel}`;

  const isNewDatabase = isDatabasesV2GA && platform !== 'rdbms-legacy';

  const currentSummary = currentPlan ? (
    <div data-testid="currentSummary">
      <StyledPlanSummarySpan>
        {isResize && 'Current Cluster: '}
        {currentPlan?.heading}
      </StyledPlanSummarySpan>{' '}
      {isDatabasesV2GA ? (
        <StyledSpan>{currentPlanPrice}</StyledSpan>
      ) : (
        <span>{currentPlanPrice}</span>
      )}
      {displayVPC ? (
        <>
          <StyledPlanSummarySpan>
            {currentClusterSize} Node
            {getSuffix(isNewDatabase, currentClusterSize)}
          </StyledPlanSummarySpan>
          <StyledSpan
            style={{ borderRight: !isVPCSelected ? 'none' : undefined }}
          >
            {currentNodePrice}
          </StyledSpan>
          {isVPCSelected && (
            <StyledPlanSummarySpan>
              {selectedVPC?.label} VPC
            </StyledPlanSummarySpan>
          )}
        </>
      ) : (
        <>
          <span>
            {currentClusterSize} Node
            {getSuffix(isNewDatabase, currentClusterSize)}
          </span>
          {currentNodePrice}
        </>
      )}
    </div>
  ) : (
    `Once you configure the cluster, you'll see the summary here.`
  );

  const resizeSummary = (
    <div
      data-testid="resizeSummary"
      style={{
        marginTop: Spacing.S16,
      }}
    >
      {resizeData ? (
        <>
          <StyledPlanSummarySpan>
            {isNewDatabase
              ? 'Resized Cluster: ' + resizeData.plan
              : resizeData.plan}
          </StyledPlanSummarySpan>{' '}
          {isNewDatabase && <StyledSpan>{resizeData.basePrice}</StyledSpan>}
          <span>
            {resizeData.numberOfNodes} Node
            {getSuffix(isNewDatabase, resizeData.numberOfNodes)}
          </span>
          {resizeData.price}
        </>
      ) : isNewDatabase ? (
        <>
          <StyledPlanSummarySpan>Resized Cluster:</StyledPlanSummarySpan> Please
          select a plan or set the number of nodes.
        </>
      ) : (
        'Please select a plan.'
      )}
    </div>
  );

  return (
    <>
      <h3
        style={{
          marginBottom: isDatabasesV2GA ? Spacing.S16 : 0,
          marginTop: 0,
        }}
      >
        Summary {isNewDatabase && label}
      </h3>
      {isNewDatabase && currentSummary}
      {isResize && resizeSummary}
    </>
  );
};
