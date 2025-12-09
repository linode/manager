import { Notice, Typography } from '@linode/ui';
import { Hidden } from '@linode/ui';
import Grid from '@mui/material/Grid';
import * as React from 'react';

import Paginate from 'src/components/Paginate';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { PLAN_PANEL_PAGE_SIZE_OPTIONS } from 'src/features/components/PlansPanel/constants';
import { useIsGenerationalPlansEnabled } from 'src/utilities/linodes';
import { PLAN_SELECTION_NO_REGION_SELECTED_MESSAGE } from 'src/utilities/pricing/constants';

import { KubernetesPlanSelection } from './KubernetesPlanSelection';
import { KubernetesPlanSelectionTable } from './KubernetesPlanSelectionTable';

import type { NodePoolConfigDrawerHandlerParams } from '../CreateCluster/CreateCluster';
import type { KubernetesTier, LinodeTypeClass } from '@linode/api-v4';
import type { PlanSelectionDividers } from 'src/features/components/PlansPanel/PlanContainer';
import type { PlanWithAvailability } from 'src/features/components/PlansPanel/types';

export interface PlanFilterRenderArgs {
  /**
   * Callback to notify parent of filter result
   */
  onResult: (result: PlanFilterRenderResult) => void;

  /**
   * All available plans (unfiltered)
   */
  plans: PlanWithAvailability[];

  /**
   * Plan type/class (e.g., 'dedicated', 'gpu')
   */
  planType: LinodeTypeClass | undefined;

  /**
   * Reset pagination back to the first page
   */
  resetPagination: () => void;

  /**
   * Whether filters should be disabled (e.g., no region selected)
   */
  shouldDisableFilters?: boolean;
}

export interface PlanFilterRenderResult {
  /**
   * Optional empty state configuration for the table body
   */
  emptyState?: null | {
    message: string;
  };

  /**
   * Filtered plans after applying filters
   */
  filteredPlans: PlanWithAvailability[];

  /**
   * The filter UI component
   */
  filterUI: React.ReactNode;

  /**
   * Whether any filters are currently active
   */
  hasActiveFilters: boolean;
}

export interface KubernetesPlanContainerProps {
  allDisabledPlans: PlanWithAvailability[];
  getTypeCount: (planId: string) => number;
  handleConfigurePool?: (params: NodePoolConfigDrawerHandlerParams) => void;
  hasMajorityOfPlansDisabled: boolean;
  onAdd?: (key: string, value: number) => void;
  onSelect: (key: string) => void;

  /**
   * Render prop for custom filter UI per tab
   * Receives plan data and pagination helpers, returns a React element
   */
  planFilters?: (args: PlanFilterRenderArgs) => React.ReactNode;

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
    planFilters,
    planType,
    plans,
    selectedId,
    selectedRegionId,
    selectedTier,
    updatePlanCount,
    wholePanelIsDisabled,
  } = props;
  const shouldDisplayNoRegionSelectedMessage = !selectedRegionId;
  const { isGenerationalPlansEnabled } = useIsGenerationalPlansEnabled(
    plans,
    planType
  );

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

  const paginationPrefix = React.useMemo(
    () => `plan-panel-k8-${planType ?? 'all'}`,
    [planType]
  );

  // State to hold filter result from the filter component
  const [filterResult, setFilterResult] =
    React.useState<null | PlanFilterRenderResult>(null);

  // Ref to store the pagination handler from Paginate component
  // This allows us to reset pagination when filters change
  const handlePageChangeRef = React.useRef<((page: number) => void) | null>(
    null
  );

  // Callback for filter component to update result
  const handleFilterResult = React.useCallback(
    (result: PlanFilterRenderResult) => {
      setFilterResult(result);
    },
    []
  );

  // Callback to reset pagination to page 1
  // Used by filter components when filters change
  const resetPagination = React.useCallback(() => {
    // Call the pagination handler to go to page 1
    handlePageChangeRef.current?.(1);
  }, []);

  // Create filter state manager component if planFilters render prop is provided
  // This component returns null but manages filter state via local React state
  // State persists when switching tabs because Reach UI TabPanels stay mounted
  // and communicates filtered results back to parent via the onResult callback
  const filterStateManager = React.useMemo(() => {
    if (isGenerationalPlansEnabled && planFilters) {
      return planFilters({
        onResult: handleFilterResult,
        planType,
        plans,
        resetPagination,
        shouldDisableFilters: shouldDisplayNoRegionSelectedMessage,
      });
    }
    return null;
  }, [
    isGenerationalPlansEnabled,
    planFilters,
    planType,
    plans,
    handleFilterResult,
    resetPagination,
    shouldDisplayNoRegionSelectedMessage,
  ]);

  // Clear filter result when filters are disabled or removed
  React.useEffect(() => {
    if (!planFilters || !isGenerationalPlansEnabled) {
      setFilterResult(null);
    }
  }, [isGenerationalPlansEnabled, planFilters]);

  // Use filtered plans if available, otherwise use all plans
  const effectiveFilterResult = isGenerationalPlansEnabled
    ? filterResult
    : null;
  const plansToDisplay = effectiveFilterResult?.filteredPlans ?? plans;
  const tableEmptyState = shouldDisplayNoRegionSelectedMessage
    ? null
    : (effectiveFilterResult?.emptyState ?? null);

  // Feature gate: if pagination is disabled, render the old way
  if (!isGenerationalPlansEnabled) {
    return (
      <Grid container spacing={2}>
        <Hidden mdUp>
          {shouldDisplayNoRegionSelectedMessage ? (
            <Notice
              spacingLeft={8}
              spacingTop={8}
              sx={(theme) => ({
                '& p': { fontSize: theme.tokens.font.FontSize.Xs },
              })}
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
                        planType={planType}
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
                  planType={planType}
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
      data={plansToDisplay}
      key={paginationPrefix}
      // Prevent Kubernetes plans panel page size changes from being persisted to global PAGE_SIZE storage.
      // Kubernetes plans panel uses custom page size options (15, 25, 50) which should not override
      // the standard page size preference (25, 50, 75, 100) used by other tables.
      noPageSizeOverride={true}
      // Set default page size to 15 (first option in PLAN_PANEL_PAGE_SIZE_OPTIONS)
      pageSize={PLAN_PANEL_PAGE_SIZE_OPTIONS[0].value}
      shouldScroll={false}
    >
      {({
        count,
        data: paginatedPlans,
        handlePageChange,
        handlePageSizeChange,
        pageSize,
        page,
      }) => {
        // Store the handlePageChange function in ref so filters can call it
        handlePageChangeRef.current = handlePageChange;

        const shouldDisplayPagination = !shouldDisplayNoRegionSelectedMessage;

        return (
          <>
            <Grid container spacing={2}>
              {filterStateManager}

              {/* Render filter UI that was passed via callback */}
              {effectiveFilterResult?.filterUI && (
                <Grid size={12}>{effectiveFilterResult.filterUI}</Grid>
              )}

              <Hidden mdUp>
                {shouldDisplayNoRegionSelectedMessage ? (
                  <Notice
                    spacingLeft={8}
                    spacingTop={8}
                    sx={(theme) => ({
                      '& p': { fontSize: theme.tokens.font.FontSize.Xs },
                    })}
                    text={PLAN_SELECTION_NO_REGION_SELECTED_MESSAGE}
                    variant="info"
                  />
                ) : tableEmptyState ? (
                  <Notice
                    spacingLeft={8}
                    spacingTop={8}
                    sx={(theme) => ({
                      '& p': { fontSize: theme.tokens.font.FontSize.Xs },
                    })}
                    text={tableEmptyState.message}
                    variant="info"
                  />
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
                  <KubernetesPlanSelectionTable
                    filterEmptyStateMessage={tableEmptyState?.message}
                    key={planType ?? 'all'}
                    plans={paginatedPlans}
                    planType={planType}
                    renderPlanSelection={renderPlanSelection}
                    shouldDisplayNoRegionSelectedMessage={
                      shouldDisplayNoRegionSelectedMessage
                    }
                  />
                </Grid>
              </Hidden>
            </Grid>
            {shouldDisplayPagination && (
              <PaginationFooter
                count={count}
                customOptions={PLAN_PANEL_PAGE_SIZE_OPTIONS}
                handlePageChange={handlePageChange}
                handleSizeChange={handlePageSizeChange}
                minPageSize={PLAN_PANEL_PAGE_SIZE_OPTIONS[0].value}
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
