import React from 'react';
import { LinodeTypeClass } from '@linode/api-v4/lib/linodes';
import { ExtendedType } from 'src/utilities/extendType';
import Grid from 'src/components/Grid';
import Hidden from 'src/components/core/Hidden';
import Table from 'src/components/Table';
import TableBody from 'src/components/core/TableBody';
import TableCell from 'src/components/TableCell';
import TableHead from 'src/components/core/TableHead';
import TableRow from 'src/components/TableRow';
import { PlanSelectionType } from './SelectPlanPanel';
import { useSelectPlanPanelStyles } from './SelectPlanPanelStyles';
import RenderSelection from './RenderSelection';

interface Props {
  header?: string;
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

const RenderPlanContainer = ({
  header,
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
  const classes = useSelectPlanPanelStyles();
  // Show the Transfer column if, for any plan, the api returned data and we're not in the Database Create flow
  const shouldShowTransfer =
    showTransfer && plans.some((plan: ExtendedType) => plan.transfer);

  // Show the Network throughput column if, for any plan, the api returned data (currently Bare Metal does not)
  const shouldShowNetwork =
    showTransfer && plans.some((plan: ExtendedType) => plan.network_out);

  return (
    <Grid container>
      <Hidden lgUp={isCreate} mdUp={!isCreate}>
        {plans.map((plan, index) => (
          <RenderSelection
            key={index}
            type={plan}
            idx={index}
            isCreate={isCreate}
            selectedDiskSize={selectedDiskSize}
            currentPlanHeading={currentPlanHeading}
            showTransfer={showTransfer}
            disabledClasses={disabledClasses}
            disabled={disabled}
            selectedID={selectedID}
            linodeID={linodeID}
            onSelect={onSelect}
          />
        ))}
      </Hidden>
      <Hidden lgDown={isCreate} mdDown={!isCreate}>
        <Grid item xs={12}>
          <Table
            aria-label="List of Linode Plans"
            className={classes.table}
            spacingBottom={16}
          >
            <TableHead>
              <TableRow>
                <TableCell className={classes.headerCell} />
                <TableCell className={classes.headerCell} data-qa-plan-header>
                  {header}
                </TableCell>
                <TableCell
                  className={classes.headerCell}
                  data-qa-monthly-header
                >
                  Monthly
                </TableCell>
                <TableCell className={classes.headerCell} data-qa-hourly-header>
                  Hourly
                </TableCell>
                <TableCell
                  className={classes.headerCell}
                  data-qa-ram-header
                  center
                >
                  RAM
                </TableCell>
                <TableCell
                  className={classes.headerCell}
                  data-qa-cpu-header
                  center
                >
                  CPUs
                </TableCell>
                <TableCell
                  className={classes.headerCell}
                  data-qa-storage-header
                  center
                >
                  Storage
                </TableCell>
                {shouldShowTransfer ? (
                  <TableCell
                    className={classes.headerCell}
                    data-qa-transfer-header
                    center
                  >
                    Transfer
                  </TableCell>
                ) : null}
                {shouldShowNetwork ? (
                  <TableCell
                    className={classes.headerCell}
                    data-qa-network-header
                    noWrap
                    center
                  >
                    Network In / Out
                  </TableCell>
                ) : null}
              </TableRow>
            </TableHead>
            <TableBody role="radiogroup">
              {plans.map((plan, index) => (
                <RenderSelection
                  key={index}
                  type={plan}
                  idx={index}
                  isCreate={isCreate}
                  selectedDiskSize={selectedDiskSize}
                  currentPlanHeading={currentPlanHeading}
                  showTransfer={showTransfer}
                  disabledClasses={disabledClasses}
                  disabled={disabled}
                  selectedID={selectedID}
                  linodeID={linodeID}
                  onSelect={onSelect}
                />
              ))}
            </TableBody>
          </Table>
        </Grid>
      </Hidden>
    </Grid>
  );
};

export default RenderPlanContainer;
