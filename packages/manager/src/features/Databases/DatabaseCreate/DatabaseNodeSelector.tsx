import {
  FormControl,
  FormControlLabel,
  Notice,
  Radio,
  RadioGroup,
  Typography,
} from '@linode/ui';
import React from 'react';

import { StyledChip } from 'src/features/components/PlansPanel/PlanSelection.styles';
import { determineInitialPlanCategoryTab } from 'src/features/components/PlansPanel/utils';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';

import { useIsDatabasesEnabled } from '../utilities';

import type {
  ClusterSize,
  DatabaseClusterSizeObject,
  DatabasePriceObject,
  Engine,
} from '@linode/api-v4/lib/databases/types';
import type {
  PlanSelectionType,
  PlanSelectionWithDatabaseType,
} from 'src/features/components/PlansPanel/types';

export interface NodePricing {
  double: DatabasePriceObject | undefined;
  multi: DatabasePriceObject | undefined;
  single: DatabasePriceObject | undefined;
}
interface Props {
  currentClusterSize?: ClusterSize | undefined;
  currentPlan?: PlanSelectionWithDatabaseType | undefined;
  displayTypes: PlanSelectionType[];
  error?: string;
  handleNodeChange: (value: ClusterSize) => void;
  selectedClusterSize: ClusterSize | undefined;
  selectedEngine: Engine;
  selectedPlan: PlanSelectionWithDatabaseType | undefined;
  selectedTab: number;
}

export const DatabaseNodeSelector = (props: Props) => {
  const {
    currentClusterSize,
    currentPlan,
    displayTypes,
    error,
    handleNodeChange,
    selectedClusterSize,
    selectedEngine,
    selectedPlan,
    selectedTab,
  } = props;

  const { isDatabasesV2Enabled } = useIsDatabasesEnabled();
  const isRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'add_databases',
  });

  const nodePricing = {
    double: selectedPlan?.engines[selectedEngine]?.find(
      (cluster: DatabaseClusterSizeObject) => cluster.quantity === 2
    )?.price,
    multi: selectedPlan?.engines[selectedEngine]?.find(
      (cluster: DatabaseClusterSizeObject) => cluster.quantity === 3
    )?.price,
    single: selectedPlan?.engines[selectedEngine]?.find(
      (cluster: DatabaseClusterSizeObject) => cluster.quantity === 1
    )?.price,
  };

  const initialTab = determineInitialPlanCategoryTab(
    displayTypes,
    currentPlan?.id
  );

  const nodeOptions = React.useMemo(() => {
    const hasDedicated = displayTypes.some(
      (type) => type.class === 'dedicated'
    );

    const currentChip = currentClusterSize && initialTab === selectedTab && (
      <StyledChip
        aria-label="This is your current number of nodes"
        label="Current"
      />
    );

    const options = [
      {
        label: (
          <Typography component="div">
            <span>1 Node {` `}</span>
            {currentClusterSize === 1 && currentChip}
            <br />
            <span style={{ fontSize: '12px' }}>
              {`$${nodePricing?.single?.monthly || 0}/month $${
                nodePricing?.single?.hourly || 0
              }/hr`}
            </span>
          </Typography>
        ),
        value: 1,
      },
    ];

    if (hasDedicated && selectedTab === 0 && isDatabasesV2Enabled) {
      options.push({
        label: (
          <Typography component="div">
            <span>2 Nodes - High Availability</span>
            {currentClusterSize === 2 && currentChip}
            <br />
            <span style={{ fontSize: '12px' }}>
              {`$${nodePricing?.double?.monthly || 0}/month $${
                nodePricing?.double?.hourly || 0
              }/hr`}
            </span>
          </Typography>
        ),
        value: 2,
      });
    }

    options.push({
      label: (
        <Typography component="div">
          <span>3 Nodes - High Availability (recommended)</span>
          {currentClusterSize === 3 && currentChip}
          <br />
          <span style={{ fontSize: '12px' }}>
            {`$${nodePricing?.multi?.monthly || 0}/month $${
              nodePricing?.multi?.hourly || 0
            }/hr`}
          </span>
        </Typography>
      ),
      value: 3,
    });

    return options;
  }, [
    selectedTab,
    nodePricing,
    displayTypes,
    isDatabasesV2Enabled,
    currentClusterSize,
    selectedClusterSize,
  ]);

  return (
    <>
      <Typography style={{ marginBottom: 4 }} variant="h2">
        Set Number of Nodes
      </Typography>
      <Typography style={{ marginBottom: 8 }}>
        We recommend 3 nodes in a database cluster to avoid downtime during
        upgrades and maintenance.
      </Typography>
      <FormControl
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          handleNodeChange(+e.target.value as ClusterSize);
        }}
        disabled={isRestricted}
      >
        {error ? <Notice text={error} variant="error" /> : null}
        <RadioGroup
          aria-disabled={isRestricted}
          data-testid="database-nodes"
          style={{ marginBottom: 0, marginTop: 0 }}
          value={selectedClusterSize ?? ''}
        >
          {nodeOptions.map((nodeOption) => (
            <FormControlLabel
              control={<Radio />}
              data-qa-radio={nodeOption.label}
              data-testid={`database-node-${nodeOption.value}`}
              key={nodeOption.value}
              label={nodeOption.label}
              sx={(theme) => ({ marginBottom: theme.spacing() })}
              value={nodeOption.value}
            />
          ))}
        </RadioGroup>
      </FormControl>
    </>
  );
};
