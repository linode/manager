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
  isWholePanelDisabled?: boolean;
  linodeID?: number | undefined;
  onSelect: (key: string) => void;
  planType?: LinodeTypeClass;
  plans: TypeWithAvailability[];
  selectedDiskSize?: number;
  selectedId?: string;
  selectedRegionId?: Region['id'];
  showTransfer?: boolean;
}

export const PlanContainer = (props: PlanContainerProps) => {
  const {
    allDisabledPlans,
    currentPlanHeading,
    hasMajorityOfPlansDisabled,
    isCreate,
    isWholePanelDisabled,
    linodeID,
    onSelect,
    planType,
    plans,
    selectedDiskSize,
    selectedId,
    selectedRegionId,
    showTransfer,
  } = props;
  const location = useLocation();

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
    filter?: (plan: TypeWithAvailability) => boolean;
    header?: string;
  }
  interface PlanSelectionFilterOptions {
    planType: LinodeTypeClass;
    tables: PlanSelectionFilterOptionsTable[];
  }

  const planFilters: PlanSelectionFilterOptions[] = [
    {
      planType: 'gpu',
      tables: [
        {
          filter: (plan: TypeWithAvailability) => plan.label.includes('Ada'),
          header: 'NVIDIA RTX 4000 Ada',
        },
        {
          filter: (plan: TypeWithAvailability) => !plan.label.includes('Ada'),
          header: 'NVIDIA Quadro RTXz 6000',
        },
      ],
    },
  ];

  const renderPlanSelection = React.useCallback(
    (filterOptions?: PlanSelectionFilterOptionsTable) => {
      const _plans = filterOptions?.filter
        ? plans.filter(filterOptions.filter)
        : plans;

      return _plans.map((plan, id) => {
        return (
          <PlanSelection
            currentPlanHeading={currentPlanHeading}
            idx={id}
            isCreate={isCreate}
            isWholePanelDisabled={isWholePanelDisabled}
            key={id}
            linodeID={linodeID}
            onSelect={onSelect}
            plan={plan}
            selectedDiskSize={selectedDiskSize}
            selectedId={selectedId}
            selectedRegionId={selectedRegionId}
            showTransfer={showTransfer}
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
      isWholePanelDisabled,
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
    filterOptions?: PlanSelectionFilterOptionsTable
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
                {isPlanCell && filterOptions?.header
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
          planFilters.map((filter) =>
            planType === filter.planType
              ? filter.tables.map((table) => [
                  <Grid key={table.header} xs={12}>
                    <Typography variant="h3">{table.header}</Typography>
                  </Grid>,
                  renderPlanSelection({
                    filter: table.filter,
                  }),
                ])
              : renderPlanSelection()
          )
        ) : (
          renderPlanSelection()
        )}
      </Hidden>
      <Hidden lgDown={isCreate} mdDown={!isCreate}>
        <Grid xs={12}>
          {selectedRegionId ? (
            planFilters.map((filter) =>
              planType === filter.planType ? (
                filter.tables.map((table, idx) => (
                  <PlanSelectionTable
                    filter={table.filter}
                    header={table.header}
                    key={`plan-filter-${idx}`}
                  />
                ))
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
