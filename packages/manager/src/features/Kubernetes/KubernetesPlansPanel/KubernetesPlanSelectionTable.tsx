import * as React from 'react';

import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { PLAN_SELECTION_NO_REGION_SELECTED_MESSAGE } from 'src/utilities/pricing/constants';

import type { PlanSelectionFilterOptionsTable } from 'src/features/components/PlansPanel/PlanContainer';

interface KubernetesPlanSelectionTableProps {
  filterOptions?: PlanSelectionFilterOptionsTable;
  renderPlanSelection: (
    filterOptions?: PlanSelectionFilterOptionsTable | undefined
  ) => React.JSX.Element[];
  shouldDisplayNoRegionSelectedMessage: boolean;
}

const tableCells = [
  { cellName: 'Plan', center: false, noWrap: false, testId: 'plan' },
  { cellName: 'Monthly', center: false, noWrap: false, testId: 'monthly' },
  { cellName: 'Hourly', center: false, noWrap: false, testId: 'hourly' },
  { cellName: 'RAM', center: true, noWrap: false, testId: 'ram' },
  { cellName: 'CPUs', center: true, noWrap: false, testId: 'cpu' },
  { cellName: 'Storage', center: true, noWrap: false, testId: 'storage' },
  { cellName: 'Quantity', center: false, noWrap: false, testId: 'quantity' },
];

export const KubernetesPlanSelectionTable = (
  props: KubernetesPlanSelectionTableProps
) => {
  const {
    filterOptions,
    renderPlanSelection,
    shouldDisplayNoRegionSelectedMessage,
  } = props;

  return (
    <Table
      aria-label={`List of ${filterOptions?.header ?? 'Linode'} Plans`}
      spacingBottom={16}
    >
      <TableHead>
        <TableRow>
          {tableCells.map(({ cellName, center, noWrap, testId }) => {
            const attributeValue = `${testId}-header`;
            return (
              <TableCell
                center={center}
                data-qa={attributeValue}
                key={testId}
                noWrap={noWrap}
              >
                {cellName === 'Quantity' ? (
                  <p className="visually-hidden">{cellName}</p>
                ) : cellName === 'Plan' && filterOptions?.header ? (
                  filterOptions.header
                ) : (
                  cellName
                )}
              </TableCell>
            );
          })}
        </TableRow>
      </TableHead>
      <TableBody role="grid">
        {shouldDisplayNoRegionSelectedMessage ? (
          <TableRowEmpty
            colSpan={9}
            message={PLAN_SELECTION_NO_REGION_SELECTED_MESSAGE}
          />
        ) : (
          renderPlanSelection()
        )}
      </TableBody>
    </Table>
  );
};
