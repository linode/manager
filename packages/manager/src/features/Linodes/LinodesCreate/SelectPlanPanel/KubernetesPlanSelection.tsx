import * as React from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import Button from 'src/components/Button';
import classNames from 'classnames';
import { EnhancedNumberInput } from 'src/components/EnhancedNumberInput/EnhancedNumberInput';
import Hidden from 'src/components/core/Hidden';
import SelectionCard from 'src/components/SelectionCard';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { convertMegabytesTo } from 'src/utilities/unitConversions';
import { ExtendedType } from 'src/utilities/extendType';
import { useSelectPlanQuantityStyles } from './styles/kubernetesPlansPanelStyles';

interface Props {
  disabled?: boolean;
  getTypeCount: (planId: string) => number;
  idx: number;
  onAdd?: (key: string, value: number) => void;
  onSelect: (key: string) => void;
  selectedID?: string;
  type: ExtendedType;
  updatePlanCount: (planId: string, newCount: number) => void;
}

export const KubernetesPlanSelection = ({
  disabled,
  getTypeCount,
  idx,
  onAdd,
  onSelect,
  selectedID,
  type,
  updatePlanCount,
}: Props) => {
  const { classes } = useSelectPlanQuantityStyles();

  const count = getTypeCount(type.id);

  // We don't want network information for LKE so we remove the last two elements.
  const subHeadings = type.subHeadings.slice(0, -2);

  const renderVariant = () => (
    <Grid xs={12}>
      <div className={classes.enhancedInputOuter}>
        <EnhancedNumberInput
          value={count}
          setValue={(newCount: number) => updatePlanCount(type.id, newCount)}
        />
        {onAdd && (
          <Button
            buttonType="primary"
            onClick={() => onAdd(type.id, count)}
            disabled={count < 1}
            className={classes.enhancedInputButton}
          >
            Add
          </Button>
        )}
      </div>
    </Grid>
  );
  return (
    <React.Fragment key={`tabbed-panel-${idx}`}>
      {/* Displays Table Row for larger screens */}
      <Hidden mdDown>
        <TableRow
          data-qa-plan-row={type.formattedLabel}
          key={type.id}
          className={classNames({
            [classes.disabledRow]: disabled,
          })}
        >
          <TableCell data-qa-plan-name>
            <div className={classes.headingCellContainer}>{type.heading} </div>
          </TableCell>
          <TableCell data-qa-monthly> ${type.price.monthly}</TableCell>
          <TableCell data-qa-hourly>{`$` + type.price.hourly}</TableCell>
          <TableCell center data-qa-ram>
            {convertMegabytesTo(type.memory, true)}
          </TableCell>
          <TableCell center data-qa-cpu>
            {type.vcpus}
          </TableCell>
          <TableCell center data-qa-storage>
            {convertMegabytesTo(type.disk, true)}
          </TableCell>
          <TableCell>
            <div className={classes.enhancedInputOuter}>
              <EnhancedNumberInput
                inputLabel={`edit-quantity-${type.id}`}
                value={count}
                setValue={(newCount: number) =>
                  updatePlanCount(type.id, newCount)
                }
                disabled={
                  // When on the add pool flow, we only want the current input to be active,
                  // unless we've just landed on the form or all the inputs are empty.
                  !onAdd && Boolean(selectedID) && type.id !== selectedID
                }
              />
              {onAdd && (
                <Button
                  buttonType="primary"
                  onClick={() => onAdd(type.id, count)}
                  disabled={count < 1}
                  className={classes.enhancedInputButton}
                >
                  Add
                </Button>
              )}
            </div>
          </TableCell>
        </TableRow>
      </Hidden>
      {/* Displays SelectionCard for small screens */}
      <Hidden mdUp>
        <SelectionCard
          key={type.id}
          checked={type.id === String(selectedID)}
          onClick={() => onSelect(type.id)}
          heading={type.heading}
          subheadings={subHeadings}
          disabled={disabled}
          renderVariant={renderVariant}
        />
      </Hidden>
    </React.Fragment>
  );
};
