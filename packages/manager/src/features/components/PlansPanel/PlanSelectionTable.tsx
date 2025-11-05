import { TooltipIcon } from '@linode/ui';
import * as React from 'react';
import type { JSX } from 'react';

import { TableBody } from 'src/components/TableBody';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { useFlags } from 'src/hooks/useFlags';
import { PLAN_SELECTION_NO_REGION_SELECTED_MESSAGE } from 'src/utilities/pricing/constants';

import { StyledTable, StyledTableCell } from './PlanContainer.styles';

import type { PlanSelectionFilterOptionsTable } from './PlanContainer';
import type { PlanWithAvailability } from './types';
import type { LinodeTypeClass } from '@linode/api-v4/';
import type { TooltipIconStatus } from '@linode/ui';

interface PlanSelectionTableProps {
  filterOptions?: PlanSelectionFilterOptionsTable;
  planRows?: React.JSX.Element[];
  plans?: PlanWithAvailability[];
  planType?: LinodeTypeClass;
  renderPlanSelection?: (
    filterOptions?: PlanSelectionFilterOptionsTable | undefined
  ) => React.JSX.Element[];
  shouldDisplayNoRegionSelectedMessage: boolean;
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
    filterOptions,
    planRows,
    planType,
    plans,
    renderPlanSelection,
    shouldDisplayNoRegionSelectedMessage,
    showNetwork: shouldShowNetwork,
    showTransfer: shouldShowTransfer,
    showUsableStorage,
  } = props;
  const flags = useFlags();

  // Auto-detect pagination mode:
  // - If planRows is provided, we're in pagination mode (modern) -> spacingBottom={0}
  // - If only renderPlanSelection is provided, we're in legacy mode -> spacingBottom={16}
  const isPaginationMode = planRows !== undefined;
  const spacingBottom = isPaginationMode ? 0 : 16;

  const showTransferTooltip = React.useCallback(
    (cellName: string) =>
      plans?.some((plan) => {
        const showTooltipForGPUPlans =
          (flags.gpuv2?.transferBanner &&
            plan.class === 'gpu' &&
            filterOptions?.header?.includes('Ada')) ||
          filterOptions?.header?.includes('Blackwell');
        return (
          (showTooltipForGPUPlans || plan.class === 'accelerated') &&
          cellName === 'Transfer'
        );
      }),
    [plans, filterOptions, flags.gpuv2]
  );

  const showUsableStorageTooltip = (cellName: string) =>
    cellName === 'Usable Storage';

  const showTooltip = (
    status: TooltipIconStatus,
    text: JSX.Element | string,
    width?: number
  ) => {
    return (
      <TooltipIcon
        status={status}
        sxTooltipIcon={{
          height: 12,
          marginTop: '-2px',
          ml: 0.5,
          px: 0,
          py: 0,
        }}
        text={text}
        width={width}
      />
    );
  };
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
            if (
              showUsableStorage &&
              !flags.dbaasV2?.beta &&
              flags.dbaasV2?.enabled &&
              cellName === 'Storage'
            ) {
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
                  showTooltip(
                    'info',
                    'Some plans do not include bundled network transfer. If the transfer allotment is 0, all outbound network transfer is subject to charges.'
                  )}
                {showUsableStorageTooltip(cellName) &&
                  showTooltip(
                    'info',
                    'Usable storage is smaller than the actual plan storage due to the overhead from the database platform.',
                    240
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
        ) : (
          (planRows ?? renderPlanSelection?.(filterOptions) ?? null)
        )}
      </TableBody>
    </StyledTable>
  );
};
