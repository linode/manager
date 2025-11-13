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

export interface PlanContainerProps {
  allDisabledPlans: PlanWithAvailability[];
  currentPlanHeading?: string;
  hasMajorityOfPlansDisabled: boolean;
  isCreate?: boolean;
  linodeID?: number | undefined;
  onSelect: (key: string) => void;
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

  // Feature gate for pagination functionality
  const isPlanPaginationEnabled = isGenerationalPlansEnabled;

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

  // Feature gate: if pagination is disabled, render the old way
  if (!isPlanPaginationEnabled) {
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
    <Paginate data={plans} key={paginationPrefix} shouldScroll={false}>
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

        return (
          <>
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
