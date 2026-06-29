import {
  Badge,
  NotificationBanner,
  RadioButton,
  RadioGroup,
} from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import React from 'react';

import { determineInitialPlanCategoryTab } from 'src/features/components/PlansPanel/utils';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';
import { useComputePricing } from 'src/utilities/pricing/useComputePricing';

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
  disabled?: boolean;
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
    disabled,
    displayTypes,
    error,
    handleNodeChange,
    selectedClusterSize,
    selectedEngine,
    selectedPlan,
    selectedTab,
  } = props;

  const isRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'add_databases',
  });

  // Pricing scoped to the selected plan via the `computePricing` LD flag.
  // `getPriceSubheading` returns either `$X/mo ($Y/hr)` or just `$Y/hr` based
  // on the active billing mode.
  const { getPriceSubheading } = useComputePricing(selectedPlan?.id);

  const formatNodePrice = React.useCallback(
    (price: DatabasePriceObject | undefined): string => {
      // Use short labels and fall back to `$0` for Databases feature when
      // no plan is selected (instead of the default `--.--` unknown-price placeholder).
      return getPriceSubheading(price, {
        format: 'short',
        missingPriceFallback: 'zero',
      });
    },
    [getPriceSubheading]
  );

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

    const hasPremium = displayTypes.some((type) => type.class === 'premium');

    const currentChip = currentClusterSize && initialTab === selectedTab && (
      <Badge
        aria-label="This is your current number of nodes"
        color="green"
        style={{ marginLeft: Spacing.S8 }}
        variant="solid"
      >
        CURRENT
      </Badge>
    );

    const options = [
      {
        label: (
          <div>
            <span>1 Node {` `}</span>
            {currentClusterSize === 1 && currentChip}
            <br />
            <span style={{ fontSize: '12px' }}>
              {formatNodePrice(nodePricing?.single)}
            </span>
          </div>
        ),
        value: 1,
      },
    ];

    const isDedicated = hasDedicated && selectedTab === 0;
    const isPremium = hasPremium && selectedTab === 2;

    const displayTwoNodesOption = isDedicated || isPremium;

    if (displayTwoNodesOption) {
      options.push({
        label: (
          <div>
            <span>2 Nodes - High Availability</span>
            {currentClusterSize === 2 && currentChip}
            <br />
            <span style={{ fontSize: '12px' }}>
              {formatNodePrice(nodePricing?.double)}
            </span>
          </div>
        ),
        value: 2,
      });
    }

    options.push({
      label: (
        <div>
          <span>3 Nodes - High Availability (recommended)</span>
          {currentClusterSize === 3 && currentChip}
          <br />
          <span style={{ fontSize: '12px' }}>
            {formatNodePrice(nodePricing?.multi)}
          </span>
        </div>
      ),
      value: 3,
    });

    return options;
  }, [
    selectedTab,
    nodePricing,
    displayTypes,
    currentClusterSize,
    selectedClusterSize,
    formatNodePrice,
  ]);

  return (
    <>
      <h3 style={{ marginBottom: 0 }}>Set Number of Nodes</h3>
      <p style={{ marginTop: 0, marginBottom: Spacing.S16 }}>
        We recommend 3 nodes in a database cluster to avoid downtime during
        upgrades and maintenance.
      </p>
      <>
        {error ? (
          <NotificationBanner
            style={{ marginBottom: Spacing.S16 }}
            text={error}
            type="error"
          />
        ) : null}
        <RadioGroup
          aria-disabled={isRestricted || disabled}
          data-testid="database-nodes"
          onChange={(e: CustomEvent) => {
            handleNodeChange(+e.detail.value as ClusterSize);
          }}
          style={{ marginBottom: 0, marginTop: 0 }}
          value={selectedClusterSize?.toString() || ''}
        >
          {nodeOptions.map((nodeOption) => (
            <div
              key={nodeOption.value}
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: Spacing.S8,
              }}
            >
              <RadioButton
                checked={selectedClusterSize === nodeOption.value}
                data-qa-dbaas-radio={nodeOption.label}
                data-testid={`database-node-${nodeOption.value}`}
                disabled={isRestricted || disabled}
                value={nodeOption.value.toString()}
              />
              <label>{nodeOption.label}</label>
            </div>
          ))}
        </RadioGroup>
      </>
    </>
  );
};
