import { Notice, Typography } from '@linode/ui';
import Grid from '@mui/material/Grid2';
import * as React from 'react';

import { Hidden } from '@linode/ui';
import { useFlags } from 'src/hooks/useFlags';
import { PLAN_SELECTION_NO_REGION_SELECTED_MESSAGE } from 'src/utilities/pricing/constants';

import { KubernetesPlanSelection } from './KubernetesPlanSelection';
import { KubernetesPlanSelectionTable } from './KubernetesPlanSelectionTable';

import type { KubernetesTier, LinodeTypeClass } from '@linode/api-v4';
import type {
  PlanSelectionDividers,
  PlanSelectionFilterOptionsTable,
} from 'src/features/components/PlansPanel/PlanContainer';
import type { PlanWithAvailability } from 'src/features/components/PlansPanel/types';

export interface KubernetesPlanContainerProps {
  allDisabledPlans: PlanWithAvailability[];
  getTypeCount: (planId: string) => number;
  hasMajorityOfPlansDisabled: boolean;
  onAdd?: (key: string, value: number) => void;
  onSelect: (key: string) => void;
  plans: PlanWithAvailability[];
  planType?: LinodeTypeClass;
  selectedId?: string;
  selectedRegionId?: string;
  selectedTier: KubernetesTier;
  updatePlanCount: (planId: string, newCount: number) => void;
  wholePanelIsDisabled: boolean;
}

export const KubernetesPlanContainer = (
  props: KubernetesPlanContainerProps
) => {
  const {
    getTypeCount,
    hasMajorityOfPlansDisabled,
    onAdd,
    onSelect,
    planType,
    plans,
    selectedId,
    selectedRegionId,
    selectedTier,
    updatePlanCount,
    wholePanelIsDisabled,
  } = props;
  const flags = useFlags();
  const shouldDisplayNoRegionSelectedMessage = !selectedRegionId;

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
    (filterOptions?: PlanSelectionFilterOptionsTable) => {
      const _plans = filterOptions?.planFilter
        ? plans.filter(filterOptions.planFilter)
        : plans;

      return _plans.map((plan, id) => {
        return (
          <KubernetesPlanSelection
            getTypeCount={getTypeCount}
            hasMajorityOfPlansDisabled={hasMajorityOfPlansDisabled}
            idx={id}
            key={id}
            onAdd={onAdd}
            onSelect={onSelect}
            plan={plan}
            selectedId={selectedId}
            selectedRegionId={selectedRegionId}
            selectedTier={selectedTier}
            updatePlanCount={updatePlanCount}
            wholePanelIsDisabled={wholePanelIsDisabled}
          />
        );
      });
    },
    [
      wholePanelIsDisabled,
      hasMajorityOfPlansDisabled,
      getTypeCount,
      onAdd,
      onSelect,
      plans,
      selectedId,
      selectedRegionId,
      selectedTier,
      updatePlanCount,
    ]
  );

  return (
    <Grid container spacing={2}>
      <Hidden mdUp>
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
                      <Grid key={table.header} size={12}>
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
      <Hidden mdDown>
        <Grid
          size={{
            lg: 12,
            xs: 12,
          }}
        >
          {planSelectionDividers.map((planSelectionDivider) =>
            planType === planSelectionDivider.planType &&
            planSelectionDivider.flag ? (
              planSelectionDivider.tables.map((table, idx) => {
                const filteredPlans = table.planFilter
                  ? plans.filter(table.planFilter)
                  : plans;
                return (
                  filteredPlans.length > 0 && (
                    <KubernetesPlanSelectionTable
                      renderPlanSelection={() =>
                        renderPlanSelection({
                          header: table.header,
                          planFilter: table.planFilter,
                        })
                      }
                      shouldDisplayNoRegionSelectedMessage={
                        shouldDisplayNoRegionSelectedMessage
                      }
                      filterOptions={table}
                      key={`k8-plan-filter-${idx}`}
                    />
                  )
                );
              })
            ) : (
              <KubernetesPlanSelectionTable
                shouldDisplayNoRegionSelectedMessage={
                  shouldDisplayNoRegionSelectedMessage
                }
                key={planType}
                renderPlanSelection={renderPlanSelection}
              />
            )
          )}
        </Grid>
      </Hidden>
    </Grid>
  );
};
