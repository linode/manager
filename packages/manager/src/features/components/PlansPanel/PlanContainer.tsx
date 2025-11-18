import { Notice, Typography } from '@linode/ui';
import { Hidden } from '@linode/ui';
import Grid from '@mui/material/Grid';
import { useLocation } from '@tanstack/react-router';
import * as React from 'react';

import Paginate from 'src/components/Paginate';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { useFlags } from 'src/hooks/useFlags';
import { useIsGenerationalPlansEnabled } from 'src/utilities/linodes';
import { PLAN_SELECTION_NO_REGION_SELECTED_MESSAGE } from 'src/utilities/pricing/constants';

import { PLAN_PANEL_PAGE_SIZE_OPTIONS } from './constants';
import { PlanSelection } from './PlanSelection';
import { PlanSelectionTable } from './PlanSelectionTable';

import type { PlanWithAvailability } from './types';
import type { Region } from '@linode/api-v4';
import type { LinodeTypeClass } from '@linode/api-v4/lib/linodes';
import type { Theme } from '@mui/material/styles';

export interface PlanSelectionFilterOptionsTable {
  header?: string;
  planFilter?: (plan: PlanWithAvailability) => boolean;
}

export interface PlanSelectionDividers {
  planType: LinodeTypeClass;
  tables: PlanSelectionFilterOptionsTable[];
}

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

export interface PlanContainerProps {
  allDisabledPlans: PlanWithAvailability[];
  currentPlanHeading?: string;
  hasMajorityOfPlansDisabled: boolean;
  isCreate?: boolean;
  linodeID?: number | undefined;
  onSelect: (key: string) => void;

  /**
   * Render prop for custom filter UI per tab
   * Receives plan data and pagination helpers, returns a React element
   */
  planFilters?: (args: PlanFilterRenderArgs) => React.ReactNode;

  plans: PlanWithAvailability[];
  planType?: LinodeTypeClass;
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
    planFilters,
    planType,
    plans,
    selectedId,
    selectedRegionId,
    showLimits,
    wholePanelIsDisabled,
  } = props;
  const location = useLocation();
  const flags = useFlags();
  const { isGenerationalPlansEnabled } = useIsGenerationalPlansEnabled();

  // Show the Transfer column if, for any plan, the api returned data and we're not in the Database Create flow
  const showTransfer =
    showLimits &&
    plans.some((plan: PlanWithAvailability) => plan.transfer !== undefined);

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

  const isDatabaseGA =
    !flags.dbaasV2?.beta &&
    flags.dbaasV2?.enabled &&
    (isDatabaseCreateFlow || isDatabaseResizeFlow);

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
      planList.map((plan, id) => {
        return (
          <PlanSelection
            currentPlanHeading={currentPlanHeading}
            hasMajorityOfPlansDisabled={hasMajorityOfPlansDisabled}
            idx={id}
            isCreate={isCreate}
            key={plan.id}
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
      }),
    [
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

  const paginationPrefix = React.useMemo(
    () => `plan-panel-${planType ?? 'all'}`,
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
  // This component returns null but manages filter state via hooks (usePlanFilters)
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
        <Hidden lgUp={isCreate} mdUp={!isCreate}>
          {isCreate && isDatabaseGA && (
            <Typography
              sx={(theme: Theme) => ({
                marginBottom: theme.spacingFunction(16),
                marginLeft: theme.spacingFunction(8),
                marginTop: theme.spacingFunction(8),
              })}
            >
              Usable storage is smaller than the actual plan storage due to the
              overhead from the database platform.
            </Typography>
          )}
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
        <Hidden lgDown={isCreate} mdDown={!isCreate}>
          <Grid size={12}>
            {planSelectionDividers.map((planSelectionDivider) =>
              planType === planSelectionDivider.planType ? (
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
                        key={`plan-filter-${idx}`}
                        plans={filteredPlans}
                        renderPlanSelection={renderPlanSelection}
                        shouldDisplayNoRegionSelectedMessage={
                          shouldDisplayNoRegionSelectedMessage
                        }
                        showNetwork={showNetwork}
                        showTransfer={showTransfer}
                      />
                    )
                  );
                })
              ) : (
                <PlanSelectionTable
                  key={planType}
                  plans={plans}
                  planType={planType}
                  renderPlanSelection={renderPlanSelection}
                  shouldDisplayNoRegionSelectedMessage={
                    shouldDisplayNoRegionSelectedMessage
                  }
                  showNetwork={showNetwork}
                  showTransfer={showTransfer}
                  showUsableStorage={
                    isDatabaseCreateFlow || isDatabaseResizeFlow
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
      // Prevent plans panel page size changes from being persisted to global PAGE_SIZE storage.
      // Plans panel uses custom page size options (15, 25, 50) which should not override
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
        page,
        pageSize,
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

              <Hidden lgUp={isCreate} mdUp={!isCreate}>
                {isCreate && isDatabaseGA && (
                  <Typography
                    sx={(theme: Theme) => ({
                      marginBottom: theme.spacingFunction(16),
                      marginLeft: theme.spacingFunction(8),
                      marginTop: theme.spacingFunction(8),
                    })}
                  >
                    Usable storage is smaller than the actual plan storage due
                    to the overhead from the database platform.
                  </Typography>
                )}
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
                  planSelectionDividers.map((planSelectionDivider) =>
                    planType === planSelectionDivider.planType
                      ? planSelectionDivider.tables.map((table) => {
                          const filteredPlans = table.planFilter
                            ? paginatedPlans.filter(table.planFilter)
                            : paginatedPlans;
                          const tableRows = renderPlanSelection(filteredPlans);

                          return [
                            filteredPlans.length > 0 && (
                              <Grid key={table.header} size={12}>
                                <Typography variant="h3">
                                  {table.header}
                                </Typography>
                              </Grid>
                            ),
                            tableRows,
                          ];
                        })
                      : renderPlanSelection(paginatedPlans)
                  )
                )}
              </Hidden>
              <Hidden lgDown={isCreate} mdDown={!isCreate}>
                <Grid size={12}>
                  {planSelectionDividers.map((planSelectionDivider) =>
                    planType === planSelectionDivider.planType ? (
                      planSelectionDivider.tables.map((table, idx) => {
                        const filteredPlans = table.planFilter
                          ? paginatedPlans.filter(table.planFilter)
                          : paginatedPlans;
                        if (filteredPlans.length === 0) {
                          return null;
                        }

                        return (
                          <PlanSelectionTable
                            filterOptions={{
                              header: table.header,
                            }}
                            key={`plan-filter-${idx}`}
                            plans={filteredPlans}
                            renderPlanSelection={renderPlanSelection}
                            shouldDisplayNoRegionSelectedMessage={
                              shouldDisplayNoRegionSelectedMessage
                            }
                            showNetwork={showNetwork}
                            showTransfer={showTransfer}
                          />
                        );
                      })
                    ) : (
                      <PlanSelectionTable
                        filterEmptyStateMessage={tableEmptyState?.message}
                        key={planType}
                        plans={paginatedPlans}
                        planType={planType}
                        renderPlanSelection={renderPlanSelection}
                        shouldDisplayNoRegionSelectedMessage={
                          shouldDisplayNoRegionSelectedMessage
                        }
                        showNetwork={showNetwork}
                        showTransfer={showTransfer}
                        showUsableStorage={
                          isDatabaseCreateFlow || isDatabaseResizeFlow
                        }
                      />
                    )
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
