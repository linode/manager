import * as React from 'react';

import { TableBody } from 'src/components/TableBody';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import {
  STORAGE_PLAN_COPY,
  VALKEY_STORAGE_TOOLTIP_COPY,
} from 'src/features/Databases/constants';
import { useIsGenerationalPlansEnabled } from 'src/utilities/linodes';
import {
  MONTHLY_COLUMN_HOURLY_ONLY_TOOLTIP_TEXT,
  PLAN_SELECTION_NO_REGION_SELECTED_MESSAGE,
} from 'src/utilities/pricing/constants';

import { StyledTable, StyledTableCell } from './PlanContainer.styles';
import { renderPlanTableTooltip } from './shared';

import type { PlanSelectionFilterOptionsTable } from './PlanContainer';
import type { PlanWithAvailability } from './types';
import type { LinodeTypeClass } from '@linode/api-v4/';

interface PlanSelectionTableProps {
  filterEmptyStateMessage?: string;
  filterOptions?: PlanSelectionFilterOptionsTable;
  plans?: PlanWithAvailability[];
  planType?: LinodeTypeClass;
  renderPlanSelection?: (
    plans: PlanWithAvailability[],
    isValkeyEngineSelected?: boolean
  ) => React.JSX.Element[];
  shouldDisplayNoRegionSelectedMessage: boolean;
  showHourlyBillingTooltip?: boolean;
  showNetwork?: boolean;
  showTransfer?: boolean;
  showUsableStorage?: boolean;
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
    filterEmptyStateMessage,
    filterOptions,
    planType,
    plans,
    renderPlanSelection,
    shouldDisplayNoRegionSelectedMessage,
    showHourlyBillingTooltip,
    showNetwork: shouldShowNetwork,
    showTransfer: shouldShowTransfer,
    showUsableStorage,
  } = props;
  const { isGenerationalPlansEnabled } = useIsGenerationalPlansEnabled(
    plans,
    planType
  );

  const isValkeyEngineSelected =
    showUsableStorage && plans?.every((plan) => plan.engines?.['valkey']);

  // Determine spacing based on feature flag:
  // - If generationalPlans is enabled (pagination mode) -> spacingBottom={0}
  // - If disabled (legacy mode) -> spacingBottom={16}
  const spacingBottom = isGenerationalPlansEnabled ? 0 : 16;

  const showTransferTooltip = React.useCallback(
    (cellName: string) => {
      const isRegionSelected = !shouldDisplayNoRegionSelectedMessage;
      return (
        (showHourlyBillingTooltip ||
          plans?.some((plan) => plan.class === 'accelerated')) &&
        isRegionSelected &&
        cellName === 'Transfer'
      );
    },
    [plans, showHourlyBillingTooltip, shouldDisplayNoRegionSelectedMessage]
  );

  const showUsableStorageTooltip = (cellName: string) =>
    cellName === 'Usable Storage';

  return (
    <StyledTable
      aria-label={`List of ${filterOptions?.header ?? 'Linode'} Plans`}
      spacingBottom={spacingBottom}
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
            if (showUsableStorage && cellName === 'Storage') {
              cellName = 'Usable Storage';
            }
            if (isPlanCell && planType === 'accelerated') {
              cellName = 'NETINT Quadra T1U';
            }
            return (
              <StyledTableCell
                center={center}
                data-qa={attributeValue}
                isPlanCell={isPlanCell}
                key={testId}
                noWrap={noWrap}
                {...(isPlanCell && { sx: { paddingLeft: 0.5 } })}
              >
                {isPlanCell && filterOptions?.header
                  ? filterOptions?.header
                  : cellName}
                {showTransferTooltip(cellName) &&
                  renderPlanTableTooltip(
                    'info',
                    'Some plans do not include bundled network transfer. If the transfer allotment is 0, all outbound network transfer is subject to charges.'
                  )}
                {showUsableStorageTooltip(cellName) &&
                  renderPlanTableTooltip(
                    'info',
                    isValkeyEngineSelected
                      ? VALKEY_STORAGE_TOOLTIP_COPY
                      : STORAGE_PLAN_COPY,
                    240
                  )}
                {/* Only show when a region is selected and the tab has hourly-only plans. */}
                {cellName === 'Monthly' &&
                  showHourlyBillingTooltip &&
                  !shouldDisplayNoRegionSelectedMessage &&
                  renderPlanTableTooltip(
                    'info',
                    MONTHLY_COLUMN_HOURLY_ONLY_TOOLTIP_TEXT
                  )}
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
        ) : filterEmptyStateMessage ? (
          <TableRowEmpty
            colSpan={tableCells.length}
            message={filterEmptyStateMessage}
          />
        ) : (
          ((plans && renderPlanSelection?.(plans, isValkeyEngineSelected)) ??
          null)
        )}
      </TableBody>
    </StyledTable>
  );
};
