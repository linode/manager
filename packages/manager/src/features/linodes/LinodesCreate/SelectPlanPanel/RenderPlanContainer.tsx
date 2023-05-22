import * as React from 'react';
import { LinodeTypeClass } from '@linode/api-v4/lib/linodes';
import Grid from '@mui/material/Unstable_Grid2';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import Hidden from 'src/components/core/Hidden';
import { ExtendedType } from 'src/utilities/extendType';
import { useSelectPlanPanelStyles } from './Styles/selectPlanPanelStyles';
import { PlanSelectionType } from '../SelectPlanPanel';
import { RenderSelection } from './RenderSelection';

const tableCells = [
  { cellName: '', testId: '', center: false, noWrap: false },
  { cellName: 'Plan', testId: 'plan', center: false, noWrap: false },
  { cellName: 'Monthly', testId: 'monthly', center: false, noWrap: false },
  { cellName: 'Hourly', testId: 'hourly', center: false, noWrap: false },
  { cellName: 'RAM', testId: 'ram', center: true, noWrap: false },
  { cellName: 'CPUs', testId: 'cpu', center: true, noWrap: false },
  { cellName: 'Storage', testId: 'storage', center: true, noWrap: false },
  { cellName: 'Transfer', testId: 'transfer', center: true, noWrap: false },
  {
    cellName: 'Network In / Out',
    testId: 'network',
    center: true,
    noWrap: true,
  },
];

// const kubernetesTableCells = [
//   { cellName: 'Plan', testId: 'plan', center: false, noWrap: false },
//   { cellName: 'Monthly', testId: 'monthly', center: false, noWrap: false },
//   { cellName: 'Hourly', testId: 'hourly', center: false, noWrap: false },
//   { cellName: 'RAM', testId: 'ram', center: true, noWrap: false },
//   { cellName: 'CPUs', testId: 'cpu', center: true, noWrap: false },
//   { cellName: 'Storage', testId: 'storage', center: true, noWrap: false },
//   { cellName: 'Quantity', testId: 'quantity', center: false, noWrap: false },
// ];

interface Props {
  isCreate?: boolean;
  plans: PlanSelectionType[];
  showTransfer?: boolean;
  selectedDiskSize?: number;
  currentPlanHeading?: string;
  disabledClasses?: LinodeTypeClass[];
  disabled?: boolean;
  onSelect: (key: string) => void;
  selectedID?: string;
  linodeID?: number | undefined;
}

export const RenderPlanContainer = ({
  isCreate,
  plans,
  showTransfer,
  selectedDiskSize,
  currentPlanHeading,
  disabledClasses,
  disabled,
  selectedID,
  linodeID,
  onSelect,
}: Props) => {
  const { classes } = useSelectPlanPanelStyles();
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
          <RenderSelection
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
          <Table
            aria-label="List of Linode Plans"
            className={classes.table}
            spacingBottom={16}
          >
            <TableHead>
              <TableRow>
                {tableCells.map(({ cellName, testId, center, noWrap }) => {
                  const attributeValue = `${testId}-header`;
                  if (
                    (!shouldShowTransfer && testId === 'transfer') ||
                    (!shouldShowNetwork && testId === 'network')
                  ) {
                    return null;
                  }
                  return (
                    <TableCell
                      className={classes.headerCell}
                      data-qa={attributeValue}
                      center={center}
                      noWrap={noWrap}
                      key={testId}
                    >
                      {cellName}
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableHead>
            <TableBody role="radiogroup">
              {plans.map((plan, id) => (
                <RenderSelection
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
          </Table>
        </Grid>
      </Hidden>
    </Grid>
  );
};
