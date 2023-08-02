import { LinodeTypeClass } from '@linode/api-v4/lib/linodes';
import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';

import { Hidden } from 'src/components/Hidden';
import { TableBody } from 'src/components/TableBody';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { ExtendedType } from 'src/utilities/extendType';

import { StyledTable, StyledTableCell } from './PlanContainer.styles';
import { PlanSelection, PlanSelectionType } from './PlanSelection';

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

export interface Props {
  currentPlanHeading?: string;
  disabled?: boolean;
  disabledClasses?: LinodeTypeClass[];
  isCreate?: boolean;
  linodeID?: number | undefined;
  onSelect: (key: string) => void;
  plans: PlanSelectionType[];
  selectedDiskSize?: number;
  selectedID?: string;
  showTransfer?: boolean;
}

export const PlanContainer = (props: Props) => {
  const {
    currentPlanHeading,
    disabled,
    disabledClasses,
    isCreate,
    linodeID,
    onSelect,
    plans,
    selectedDiskSize,
    selectedID,
    showTransfer,
  } = props;
  // Show the Transfer column if, for any plan, the api returned data and we're not in the Database Create flow
  const shouldShowTransfer =
    showTransfer && plans.some((plan: ExtendedType) => plan.transfer);

  // Show the Network throughput column if, for any plan, the api returned data (currently Bare Metal does not)
  const shouldShowNetwork =
    showTransfer && plans.some((plan: ExtendedType) => plan.network_out);

  return (
    <Grid container spacing={2}>
      <Hidden lgUp={isCreate} mdUp={!isCreate}>
        {plans.map((plan, id) => (
          <PlanSelection
            currentPlanHeading={currentPlanHeading}
            disabled={disabled}
            disabledClasses={disabledClasses}
            idx={id}
            isCreate={isCreate}
            key={id}
            linodeID={linodeID}
            onSelect={onSelect}
            selectedDiskSize={selectedDiskSize}
            selectedID={selectedID}
            showTransfer={showTransfer}
            type={plan}
          />
        ))}
      </Hidden>
      <Hidden lgDown={isCreate} mdDown={!isCreate}>
        <Grid xs={12}>
          <StyledTable
            aria-label="List of Linode Plans"
            isDisabled={disabled}
            spacingBottom={16}
          >
            <TableHead>
              <TableRow>
                {tableCells.map(({ cellName, center, noWrap, testId }) => {
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
                      isPlanCell={cellName === 'Plan'}
                      key={testId}
                      noWrap={noWrap}
                    >
                      {cellName}
                    </StyledTableCell>
                  );
                })}
              </TableRow>
            </TableHead>
            <TableBody role="radiogroup">
              {plans.map((plan, id) => (
                <PlanSelection
                  currentPlanHeading={currentPlanHeading}
                  disabled={disabled}
                  disabledClasses={disabledClasses}
                  idx={id}
                  isCreate={isCreate}
                  key={id}
                  linodeID={linodeID}
                  onSelect={onSelect}
                  selectedDiskSize={selectedDiskSize}
                  selectedID={selectedID}
                  showTransfer={showTransfer}
                  type={plan}
                />
              ))}
            </TableBody>
          </StyledTable>
        </Grid>
      </Hidden>
    </Grid>
  );
};
