import { Notice, Typography } from '@linode/ui';
import { Hidden } from '@linode/ui';
import Grid from '@mui/material/Grid';
import { type ToSubOptions, useLocation } from '@tanstack/react-router';
import * as React from 'react';

import Paginate from 'src/components/Paginate';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { PLAN_PANEL_PAGE_SIZE_OPTIONS } from 'src/features/components/PlansPanel/constants';
import { usePaginationV2 } from 'src/hooks/usePaginationV2';
import { useIsGenerationalPlansEnabled } from 'src/utilities/linodes';
import { PLAN_SELECTION_NO_REGION_SELECTED_MESSAGE } from 'src/utilities/pricing/constants';

import { KubernetesPlanSelection } from './KubernetesPlanSelection';
import { KubernetesPlanSelectionTable } from './KubernetesPlanSelectionTable';

import type { NodePoolConfigDrawerHandlerParams } from '../CreateCluster/CreateCluster';
import type { KubernetesTier, LinodeTypeClass } from '@linode/api-v4';
import type { PlanSelectionDividers } from 'src/features/components/PlansPanel/PlanContainer';
import type { PlanWithAvailability } from 'src/features/components/PlansPanel/types';

export interface KubernetesPlanContainerProps {
  allDisabledPlans: PlanWithAvailability[];
  getTypeCount: (planId: string) => number;
  handleConfigurePool?: (params: NodePoolConfigDrawerHandlerParams) => void;
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
    handleConfigurePool,
    onSelect,
    planType,
    plans,
    selectedId,
    selectedRegionId,
    selectedTier,
    updatePlanCount,
    wholePanelIsDisabled,
  } = props;
  const shouldDisplayNoRegionSelectedMessage = !selectedRegionId;
  const { isGenerationalPlansEnabled } = useIsGenerationalPlansEnabled();

  // Feature gate for pagination functionality
  const isK8PlanPaginationEnabled = isGenerationalPlansEnabled;

  /**
   * This features allows us to divide the GPU plans into two separate tables.
   * This can be re-used for other plan types in the future.
   */
  const planSelectionDividers: PlanSelectionDividers[] = [
    {
      planType: 'gpu',
      tables: [
        {
          header: 'NVIDIA RTX PRO 6000 Blackwell Server Edition',
          planFilter: (plan: PlanWithAvailability) =>
            plan.label.includes('Blackwell'),
        },
        {
          header: 'NVIDIA RTX 4000 Ada',
          planFilter: (plan: PlanWithAvailability) =>
            plan.label.includes('Ada'),
        },
        {
          header: 'NVIDIA Quadro RTX 6000',
          planFilter: (plan: PlanWithAvailability) =>
            !plan.label.includes('Ada') && !plan.label.includes('Blackwell'),
        },
      ],
    },
  ];

  const renderPlanSelection = React.useCallback(
    (planList: PlanWithAvailability[]) =>
      planList.map((plan, idx) => (
        <KubernetesPlanSelection
          getTypeCount={getTypeCount}
          handleConfigurePool={handleConfigurePool}
          hasMajorityOfPlansDisabled={hasMajorityOfPlansDisabled}
          idx={idx}
          key={plan.id}
          onAdd={onAdd}
          onSelect={onSelect}
          plan={plan}
          selectedId={selectedId}
          selectedRegionId={selectedRegionId}
          selectedTier={selectedTier}
          updatePlanCount={updatePlanCount}
          wholePanelIsDisabled={wholePanelIsDisabled}
        />
      )),
    [
      getTypeCount,
      handleConfigurePool,
      hasMajorityOfPlansDisabled,
      onAdd,
      onSelect,
      selectedId,
      selectedRegionId,
      selectedTier,
      updatePlanCount,
      wholePanelIsDisabled,
    ]
  );

  const location = useLocation();

  const paginationPrefix = React.useMemo(
    () => `plan-panel-k8-${planType ?? 'all'}`,
    [planType]
  );

  const pagination = usePaginationV2({
    currentRoute: location.pathname as ToSubOptions['to'],
    defaultPageSize: PLAN_PANEL_PAGE_SIZE_OPTIONS[0].value,
    initialPage: 1,
    preferenceKey: paginationPrefix,
    queryParamsPrefix: paginationPrefix,
  });

  // Feature gate: if pagination is disabled, render the old way
  if (!isK8PlanPaginationEnabled) {
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
              planType === planSelectionDivider.planType
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
                      renderPlanSelection(filteredPlans),
                    ];
                  })
                : renderPlanSelection(plans)
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
              planType === planSelectionDivider.planType ? (
                planSelectionDivider.tables.map((table, idx) => {
                  const filteredPlans = table.planFilter
                    ? plans.filter(table.planFilter)
                    : plans;
                  return (
                    filteredPlans.length > 0 && (
                      <KubernetesPlanSelectionTable
                        filterOptions={table}
                        key={`k8-plan-filter-${idx}`}
                        plans={filteredPlans}
                        renderPlanSelection={renderPlanSelection}
                        shouldDisplayNoRegionSelectedMessage={
                          shouldDisplayNoRegionSelectedMessage
                        }
                      />
                    )
                  );
                })
              ) : (
                <KubernetesPlanSelectionTable
                  key={planType}
                  plans={plans}
                  renderPlanSelection={renderPlanSelection}
                  shouldDisplayNoRegionSelectedMessage={
                    shouldDisplayNoRegionSelectedMessage
                  }
                />
              )
            )}
          </Grid>
        </Hidden>
      </Grid>
    );
  }

  // Pagination enabled: use new paginated rendering
  return (
    <Paginate
      data={plans}
      key={paginationPrefix}
      page={pagination.page}
      pageSize={pagination.pageSize}
      pageSizeSetter={pagination.handlePageSizeChange}
      shouldScroll={false}
      updatePageUrl={pagination.handlePageChange}
    >
      {({
        count,
        data: paginatedPlans,
        handlePageChange,
        handlePageSizeChange,
        page,
        pageSize,
      }) => {
        const shouldDisplayPagination =
          !shouldDisplayNoRegionSelectedMessage &&
          count > PLAN_PANEL_PAGE_SIZE_OPTIONS[0].value;

        const dividerTables = planSelectionDividers
          .map((divider) => ({
            planType: divider.planType,
            tables: divider.tables
              .map((table) => ({
                filterOptions: table,
                plans: table.planFilter
                  ? paginatedPlans.filter(table.planFilter)
                  : paginatedPlans,
              }))
              .filter((table) => table.plans.length > 0),
          }))
          .filter((divider) => divider.tables.length > 0);

        const activeDivider = dividerTables.find(
          (divider) => divider.planType === planType
        );

        const hasActiveGpuDivider = planType === 'gpu' && activeDivider;

        return (
          <>
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
                ) : hasActiveGpuDivider ? (
                  activeDivider.tables.map(({ filterOptions, plans }, idx) => (
                    <React.Fragment
                      key={`k8-mobile-${filterOptions.header ?? idx}`}
                    >
                      {filterOptions.header ? (
                        <Grid size={12}>
                          <Typography variant="h3">
                            {filterOptions.header}
                          </Typography>
                        </Grid>
                      ) : null}
                      {renderPlanSelection(plans)}
                    </React.Fragment>
                  ))
                ) : (
                  renderPlanSelection(paginatedPlans)
                )}
              </Hidden>
              <Hidden mdDown>
                <Grid
                  size={{
                    lg: 12,
                    xs: 12,
                  }}
                >
                  {hasActiveGpuDivider ? (
                    activeDivider.tables.map(
                      ({ filterOptions, plans }, idx) => (
                        <KubernetesPlanSelectionTable
                          filterOptions={filterOptions}
                          key={`k8-plan-filter-${idx}`}
                          plans={plans}
                          renderPlanSelection={renderPlanSelection}
                          shouldDisplayNoRegionSelectedMessage={
                            shouldDisplayNoRegionSelectedMessage
                          }
                        />
                      )
                    )
                  ) : (
                    <KubernetesPlanSelectionTable
                      key={planType ?? 'all'}
                      plans={paginatedPlans}
                      renderPlanSelection={renderPlanSelection}
                      shouldDisplayNoRegionSelectedMessage={
                        shouldDisplayNoRegionSelectedMessage
                      }
                    />
                  )}
                </Grid>
              </Hidden>
            </Grid>
            {shouldDisplayPagination && (
              <PaginationFooter
                count={count}
                customOptions={PLAN_PANEL_PAGE_SIZE_OPTIONS}
                handlePageChange={handlePageChange}
                handleSizeChange={handlePageSizeChange}
                page={page}
                pageSize={pageSize}
                sx={{
                  borderLeft: 'none',
                  borderRight: 'none',
                }}
              />
            )}
          </>
        );
      }}
    </Paginate>
  );
};
