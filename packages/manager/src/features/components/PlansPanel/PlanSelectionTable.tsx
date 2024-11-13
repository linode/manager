import * as React from 'react';

import { TableBody } from 'src/components/TableBody';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { PLAN_SELECTION_NO_REGION_SELECTED_MESSAGE } from 'src/utilities/pricing/constants';

import { StyledTable, StyledTableCell } from './PlanContainer.styles';
import { PlanWithAvailability } from './types';

interface PlanSelectionFilterOptionsTable {
  header?: string;
  planFilter?: (plan: PlanWithAvailability) => boolean;
}

interface PlanSelectionTableProps {
  filterOptions?: PlanSelectionFilterOptionsTable;
  planFilter?: (plan: PlanWithAvailability) => boolean;
  renderPlanSelection: (
    filterOptions?: PlanSelectionFilterOptionsTable | undefined
  ) => React.JSX.Element[];
  shouldDisplayNoRegionSelectedMessage: boolean;
  showNetwork?: boolean;
  showTransfer?: boolean;
}

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

export const PlanSelectionTable = (props: PlanSelectionTableProps) => {
  const {
    filterOptions,
    renderPlanSelection,
    shouldDisplayNoRegionSelectedMessage,
    showNetwork: shouldShowNetwork,
    showTransfer: shouldShowTransfer,
  } = props;

  return (
    <StyledTable
      aria-label={`List of ${filterOptions?.header ?? 'Linode'} Plans`}
      spacingBottom={16}
    >
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
            colSpan={tableCells.length}
            message={PLAN_SELECTION_NO_REGION_SELECTED_MESSAGE}
          />
        ) : (
          renderPlanSelection(filterOptions)
        )}
      </TableBody>
    </StyledTable>
  );
};
