import { Box, Typography } from '@linode/ui';
import React from 'react';

import { useFlags } from 'src/hooks/useFlags';

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
import type { Theme } from '@mui/material';
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

  const currentPrice = currentPlan?.engines[currentEngine].find(
    (cluster: DatabaseClusterSizeObject) =>
      cluster.quantity === currentClusterSize
  )?.price as DatabasePriceObject;

  const currentBasePrice = currentPlan?.engines[currentEngine][0]
    .price as DatabasePriceObject;

  const currentNodePrice = `$${currentPrice?.monthly}/month`;
  const currentPlanPrice = `$${currentBasePrice?.monthly}/month`;

  const isNewDatabase = isDatabasesV2GA && platform !== 'rdbms-legacy';

  const currentSummary = currentPlan ? (
    <Box data-testid="currentSummary">
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
          <Typography component="span">
            {currentClusterSize} Node
            {getSuffix(isNewDatabase, currentClusterSize)}
          </Typography>
          {currentNodePrice}
        </>
      )}
    </Box>
  ) : (
    'Please specify your cluster configuration'
  );

  const resizeSummary = (
    <Box
      data-testid="resizeSummary"
      sx={(theme: Theme) => ({
        marginTop: theme.spacing(2),
      })}
    >
      {resizeData ? (
        <>
          <StyledPlanSummarySpan>
            {isNewDatabase
              ? 'Resized Cluster: ' + resizeData.plan
              : resizeData.plan}
          </StyledPlanSummarySpan>{' '}
          {isNewDatabase && <StyledSpan>{resizeData.basePrice}</StyledSpan>}
          <Typography component="span">
            {resizeData.numberOfNodes} Node
            {getSuffix(isNewDatabase, resizeData.numberOfNodes)}
          </Typography>
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
    </Box>
  );

  return (
    <>
      <Typography
        sx={(theme) => ({
          marginBottom: isDatabasesV2GA ? theme.spacing(2) : 0,
        })}
        variant="h2"
      >
        Summary {isNewDatabase && label}
      </Typography>
      {isNewDatabase && currentSummary}
      {isResize && resizeSummary}
    </>
  );
};
