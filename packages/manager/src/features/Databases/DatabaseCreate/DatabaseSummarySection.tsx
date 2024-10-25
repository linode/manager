import React from 'react';

import { Box } from 'src/components/Box';
import { Typography } from 'src/components/Typography';

import { StyledPlanSummarySpan } from '../DatabaseDetail/DatabaseResize/DatabaseResize.style';
import { useIsDatabasesEnabled } from '../utilities';
import { useStyles } from './DatabaseCreate.style';

import type {
  ClusterSize,
  DatabaseClusterSizeObject,
  DatabasePriceObject,
  Engine,
} from '@linode/api-v4';
import type { PlanSelectionWithDatabaseType } from 'src/features/components/PlansPanel/types';

interface Props {
  currentClusterSize: ClusterSize;
  currentEngine: Engine;
  currentPlan: PlanSelectionWithDatabaseType | undefined;
  isResize?: boolean;
  label?: string;
  platform?: string;
  resizeData?: {
    basePrice: string;
    numberOfNodes: ClusterSize;
    plan: string;
    price: string;
  };
}

export const DatabaseSummarySection = (props: Props) => {
  const { classes } = useStyles();
  const {
    currentClusterSize,
    currentEngine,
    currentPlan,
    isResize,
    label,
    platform,
    resizeData,
  } = props;
  const { isDatabasesV2GA } = useIsDatabasesEnabled();

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
      <span className={isDatabasesV2GA ? classes.summarySpanBorder : ''}>
        {currentPlanPrice}
      </span>
      <span className={classes.nodeSpanSpacing}>
        {' '}
        {currentClusterSize} Node
        {currentClusterSize > 1 ? 's - HA ' : ' '}
      </span>
      {currentNodePrice}
    </Box>
  ) : (
    'Please specify your cluster configuration'
  );
  const resizeSummary = (
    <Box
      sx={(theme) => ({
        marginTop: theme.spacing(2),
      })}
      data-testid="resizeSummary"
    >
      {resizeData ? (
        <>
          <StyledPlanSummarySpan>
            {isNewDatabase
              ? 'Resized Cluster: ' + resizeData.plan
              : resizeData.plan}
          </StyledPlanSummarySpan>{' '}
          {isNewDatabase && (
            <span className={classes.summarySpanBorder}>
              {resizeData.basePrice}
            </span>
          )}
          <span className={isNewDatabase ? classes.nodeSpanSpacing : ''}>
            {' '}
            {resizeData.numberOfNodes} Node
            {resizeData.numberOfNodes > 1 ? 's' : ''}
            {!isNewDatabase ? ': ' : ' - HA '}
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
