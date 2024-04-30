import { LinodeTypeClass } from '@linode/api-v4/lib/linodes';
import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';
import { useLocation } from 'react-router-dom';

import { Hidden } from 'src/components/Hidden';
import { Notice } from 'src/components/Notice/Notice';
import { TableBody } from 'src/components/TableBody';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { Typography } from 'src/components/Typography';
import { useFlags } from 'src/hooks/useFlags';
import { PLAN_SELECTION_NO_REGION_SELECTED_MESSAGE } from 'src/utilities/pricing/constants';

import { StyledTable, StyledTableCell } from './PlanContainer.styles';
import { PlanSelection } from './PlanSelection';

import type { TypeWithAvailability } from './types';
import type { Region } from '@linode/api-v4';

const tableCells = [
  { cellName: '', center: false, noWrap: false, testId: '' },
  { cellName: 'Plan', center: false, noWrap: false, testId: 'plan' },
  { cellName: 'Monthly', center: false, noWrap: false, testId: 'monthly' },
  { cellName: 'Hourly', center: false, noWrap: false, testId: 'hourly' },
  { cellName: 'RAM', center: true, noWrap: false, testId: 'ram' },
  { cellName: 'CPUs', center: true, noWrap: false, testId: 'cpu' },
  { cellName: 'Storage', center: true, noWrap: false, testId: 'storage' },
  { cellName: 'Transfer', center: true, noWrap: false, testId: 'transfer' },
  {
    cellName: 'Network In / Out',
    center: true,
    noWrap: true,
    testId: 'network',
  },
];

export interface PlanContainerProps {
  allDisabledPlans: TypeWithAvailability[];
  currentPlanHeading?: string;
  hasMajorityOfPlansDisabled: boolean;
  isCreate?: boolean;
  linodeID?: number | undefined;
  onSelect: (key: string) => void;
  planType?: LinodeTypeClass;
  plans: TypeWithAvailability[];
  selectedDiskSize?: number;
  selectedId?: string;
  selectedRegionId?: Region['id'];
  showTransfer?: boolean;
  wholePanelIsDisabled?: boolean;
}

export const PlanContainer = (props: PlanContainerProps) => {
  const {
    allDisabledPlans,
    currentPlanHeading,
    hasMajorityOfPlansDisabled,
    isCreate,
    linodeID,
    onSelect,
    planType,
    plans,
    selectedDiskSize,
    selectedId,
    selectedRegionId,
    showTransfer,
    wholePanelIsDisabled,
  } = props;
  const location = useLocation();
  const flags = useFlags();

  // Show the Transfer column if, for any plan, the api returned data and we're not in the Database Create flow
  const shouldShowTransfer =
    showTransfer && plans.some((plan: TypeWithAvailability) => plan.transfer);

  // Show the Network throughput column if, for any plan, the api returned data (currently Bare Metal does not)
  const shouldShowNetwork =
    showTransfer &&
    plans.some((plan: TypeWithAvailability) => plan.network_out);

  // DC Dynamic price logic - DB creation and DB resize flows are currently out of scope
  const isDatabaseCreateFlow = location.pathname.includes('/databases/create');
  const isDatabaseResizeFlow =
    location.pathname.match(/\/databases\/.*\/(\d+\/resize)/)?.[0] ===
    location.pathname;
  const shouldDisplayNoRegionSelectedMessage =
    !selectedRegionId && !isDatabaseCreateFlow && !isDatabaseResizeFlow;

  interface PlanSelectionFilterOptionsTable {
    header?: string;
    planFilter?: (plan: TypeWithAvailability) => boolean;
  }
  interface PlanSelectionFilterOptions {
    flag: boolean;
    planType: LinodeTypeClass;
    tables: PlanSelectionFilterOptionsTable[];
  }

  /**
   * This features allows us to split the GPU plans into two tables.
   * This can be re-used for other plan types in the future.
   */
  const planSplitters: PlanSelectionFilterOptions[] = [
    {
      flag: Boolean(flags.gpuv2?.plansSplitting),
      planType: 'gpu',
      tables: [
        {
          header: 'NVIDIA RTX 4000 Ada',
          planFilter: (plan: TypeWithAvailability) =>
            plan.label.includes('Ada'),
        },
        {
          header: 'NVIDIA Quadro RTXz 6000',
          planFilter: (plan: TypeWithAvailability) =>
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
          <PlanSelection
            currentPlanHeading={currentPlanHeading}
            hasMajorityOfPlansDisabled={hasMajorityOfPlansDisabled}
            idx={id}
            isCreate={isCreate}
            key={id}
            linodeID={linodeID}
            onSelect={onSelect}
            plan={plan}
            selectedDiskSize={selectedDiskSize}
            selectedId={selectedId}
            selectedRegionId={selectedRegionId}
            showTransfer={showTransfer}
            wholePanelIsDisabled={wholePanelIsDisabled}
          />
        );
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      allDisabledPlans,
      hasMajorityOfPlansDisabled,
      plans,
      selectedRegionId,
      wholePanelIsDisabled,
      currentPlanHeading,
      isCreate,
      linodeID,
      onSelect,
      selectedDiskSize,
      selectedId,
      showTransfer,
    ]
  );

  const PlanSelectionTable = (
    filterOptions?: PlanSelectionFilterOptionsTable & { changeHeader?: boolean }
  ) => (
    <StyledTable aria-label="List of Linode Plans" spacingBottom={16}>
      <TableHead>
        <TableRow>
          {tableCells.map(({ cellName, center, noWrap, testId }) => {
            const isPlanCell = cellName === 'Plan';
            const attributeValue = `${testId}-header`;
            if (
              (!shouldShowTransfer && testId === 'transfer') ||
              (!shouldShowNetwork && testId === 'network')
            ) {
              return null;
            }
            return (
              <StyledTableCell
                center={center}
                data-qa={attributeValue}
                isPlanCell={isPlanCell}
                key={testId}
                noWrap={noWrap}
              >
                {isPlanCell &&
                filterOptions?.header &&
                filterOptions.changeHeader
                  ? filterOptions?.header
                  : cellName}
              </StyledTableCell>
            );
          })}
        </TableRow>
      </TableHead>
      <TableBody role="radiogroup">
        {shouldDisplayNoRegionSelectedMessage ? (
          <TableRowEmpty
            colSpan={9}
            message={PLAN_SELECTION_NO_REGION_SELECTED_MESSAGE}
          />
        ) : (
          renderPlanSelection(filterOptions)
        )}
      </TableBody>
    </StyledTable>
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
        ) : selectedRegionId ? (
          planSplitters.map((splitter) =>
            planType === splitter.planType && splitter.flag
              ? splitter.tables.map((table) => {
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
        ) : (
          renderPlanSelection()
        )}
      </Hidden>
      <Hidden lgDown={isCreate} mdDown={!isCreate}>
        <Grid xs={12}>
          {selectedRegionId ? (
            planSplitters.map((splitter) =>
              planType === splitter.planType && splitter.flag ? (
                splitter.tables.map((table, idx) => {
                  const filteredPlans = table.planFilter
                    ? plans.filter(table.planFilter)
                    : plans;
                  return (
                    filteredPlans.length > 0 && (
                      <PlanSelectionTable
                        changeHeader={splitter.flag}
                        header={table.header}
                        key={`plan-filter-${idx}`}
                        planFilter={table.planFilter}
                      />
                    )
                  );
                })
              ) : (
                <PlanSelectionTable key={planType} />
              )
            )
          ) : (
            <PlanSelectionTable />
          )}
        </Grid>
      </Hidden>
    </Grid>
  );
};
