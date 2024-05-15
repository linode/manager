import { LinodeTypeClass } from '@linode/api-v4/lib/linodes';
import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';
import { useLocation } from 'react-router-dom';

import { Hidden } from 'src/components/Hidden';
import { Notice } from 'src/components/Notice/Notice';
import { Typography } from 'src/components/Typography';
import { useFlags } from 'src/hooks/useFlags';
import { PLAN_SELECTION_NO_REGION_SELECTED_MESSAGE } from 'src/utilities/pricing/constants';

import { PlanSelection } from './PlanSelection';
import { PlanSelectionTable } from './PlanSelectionTable';

import type { PlanWithAvailability } from './types';
import type { Region } from '@linode/api-v4';

export interface PlanContainerProps {
  allDisabledPlans: PlanWithAvailability[];
  currentPlanHeading?: string;
  hasMajorityOfPlansDisabled: boolean;
  isCreate?: boolean;
  linodeID?: number | undefined;
  onSelect: (key: string) => void;
  planType?: LinodeTypeClass;
  plans: PlanWithAvailability[];
  selectedDiskSize?: number;
  selectedId?: string;
  selectedRegionId?: Region['id'];
  showLimits?: boolean;
  wholePanelIsDisabled?: boolean;
}

export const PlanContainer = (props: PlanContainerProps) => {
  const {
    currentPlanHeading,
    hasMajorityOfPlansDisabled,
    isCreate,
    linodeID,
    onSelect,
    planType,
    plans,
    selectedId,
    selectedRegionId,
    showLimits,
    wholePanelIsDisabled,
  } = props;
  const location = useLocation();
  const flags = useFlags();

  // Show the Transfer column if, for any plan, the api returned data and we're not in the Database Create flow
  const showTransfer =
    showLimits && plans.some((plan: PlanWithAvailability) => plan.transfer);

  // Show the Network throughput column if, for any plan, the api returned data (currently Bare Metal does not)
  const showNetwork =
    showLimits && plans.some((plan: PlanWithAvailability) => plan.network_out);

  // DC Dynamic price logic - DB creation and DB resize flows are currently out of scope
  const isDatabaseCreateFlow = location.pathname.includes('/databases/create');
  const isDatabaseResizeFlow =
    location.pathname.match(/\/databases\/.*\/(\d+\/resize)/)?.[0] ===
    location.pathname;
  const shouldDisplayNoRegionSelectedMessage =
    !selectedRegionId && !isDatabaseCreateFlow && !isDatabaseResizeFlow;

  interface PlanSelectionDividerTable {
    header?: string;
    planFilter?: (plan: PlanWithAvailability) => boolean;
  }
  interface PlanSelectionDividers {
    flag: boolean;
    planType: LinodeTypeClass;
    tables: PlanSelectionDividerTable[];
  }

  /**
   * This features allows us to divide the GPU plans into two separate tables.
   * This can be re-used for other plan types in the future.
   */
  const planSelectionDividers: PlanSelectionDividers[] = [
    {
      flag: Boolean(flags.gpuv2?.planDivider),
      planType: 'gpu',
      tables: [
        {
          header: 'NVIDIA RTX 4000 Ada',
          planFilter: (plan: PlanWithAvailability) =>
            plan.label.includes('Ada'),
        },
        {
          header: 'NVIDIA Quadro RTX 6000',
          planFilter: (plan: PlanWithAvailability) =>
            !plan.label.includes('Ada'),
        },
      ],
    },
  ];

  const renderPlanSelection = React.useCallback(
    (filterOptions?: PlanSelectionDividerTable) => {
      const _plans = filterOptions?.planFilter
        ? plans.filter(filterOptions.planFilter)
        : plans;

      return _plans.map((plan, id) => {
        return (
          <PlanSelection
            currentPlanHeading={currentPlanHeading}
            hasMajorityOfPlansDisabled={hasMajorityOfPlansDisabled}
            idx={id}
            isCreate={isCreate}
            key={id}
            linodeID={linodeID}
            onSelect={onSelect}
            plan={plan}
            selectedId={selectedId}
            selectedRegionId={selectedRegionId}
            showNetwork={showNetwork}
            showTransfer={showTransfer}
            wholePanelIsDisabled={wholePanelIsDisabled}
          />
        );
      });
    },
    [
      plans,
      currentPlanHeading,
      hasMajorityOfPlansDisabled,
      isCreate,
      linodeID,
      onSelect,
      selectedId,
      selectedRegionId,
      showNetwork,
      showTransfer,
      wholePanelIsDisabled,
    ]
  );

  return (
    <Grid container spacing={2}>
      <Hidden lgUp={isCreate} mdUp={!isCreate}>
        {shouldDisplayNoRegionSelectedMessage ? (
          <Notice
            spacingLeft={8}
            spacingTop={8}
            sx={{ '& p': { fontSize: '0.875rem' } }}
            text={PLAN_SELECTION_NO_REGION_SELECTED_MESSAGE}
            variant="info"
          />
        ) : (
          planSelectionDividers.map((planSelectionDivider) =>
            planType === planSelectionDivider.planType &&
            planSelectionDivider.flag
              ? planSelectionDivider.tables.map((table) => {
                  const filteredPlans = table.planFilter
                    ? plans.filter(table.planFilter)
                    : plans;
                  return [
                    filteredPlans.length > 0 && (
                      <Grid key={table.header} xs={12}>
                        <Typography variant="h3">{table.header}</Typography>
                      </Grid>
                    ),
                    renderPlanSelection({
                      planFilter: table.planFilter,
                    }),
                  ];
                })
              : renderPlanSelection()
          )
        )}
      </Hidden>
      <Hidden lgDown={isCreate} mdDown={!isCreate}>
        <Grid xs={12}>
          {planSelectionDividers.map((planSelectionDivider) =>
            planType === planSelectionDivider.planType &&
            planSelectionDivider.flag ? (
              planSelectionDivider.tables.map((table, idx) => {
                const filteredPlans = table.planFilter
                  ? plans.filter(table.planFilter)
                  : plans;
                return (
                  filteredPlans.length > 0 && (
                    <PlanSelectionTable
                      filterOptions={{
                        header: table.header,
                      }}
                      renderPlanSelection={() =>
                        renderPlanSelection({
                          header: table.header,
                          planFilter: table.planFilter,
                        })
                      }
                      shouldDisplayNoRegionSelectedMessage={
                        shouldDisplayNoRegionSelectedMessage
                      }
                      key={`plan-filter-${idx}`}
                      planFilter={table.planFilter}
                      showNetwork={showNetwork}
                      showTransfer={showTransfer}
                    />
                  )
                );
              })
            ) : (
              <PlanSelectionTable
                shouldDisplayNoRegionSelectedMessage={
                  shouldDisplayNoRegionSelectedMessage
                }
                key={planType}
                renderPlanSelection={renderPlanSelection}
                showNetwork={showNetwork}
                showTransfer={showTransfer}
              />
            )
          )}
        </Grid>
      </Hidden>
    </Grid>
  );
};
