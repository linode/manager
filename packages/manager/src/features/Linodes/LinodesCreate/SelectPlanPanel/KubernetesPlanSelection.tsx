import * as React from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';
import { Button } from 'src/components/Button/Button';
import { EnhancedNumberInput } from 'src/components/EnhancedNumberInput/EnhancedNumberInput';
import Hidden from 'src/components/core/Hidden';
import SelectionCard from 'src/components/SelectionCard';
import { TableCell } from 'src/components/TableCell';
import { convertMegabytesTo } from 'src/utilities/unitConversions';
import { ExtendedType } from 'src/utilities/extendType';
import { StyledDisabledTableRow } from './PlansPanel.styles';

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
  const count = getTypeCount(type.id);

  // We don't want network information for LKE so we remove the last two elements.
  const subHeadings = type.subHeadings.slice(0, -2);

  const renderVariant = () => (
    <Grid xs={12}>
      <StyledInputOuter>
        <EnhancedNumberInput
          value={count}
          setValue={(newCount: number) => updatePlanCount(type.id, newCount)}
          disabled={disabled}
        />
        {onAdd && (
          <Button
            buttonType="primary"
            onClick={() => onAdd(type.id, count)}
            disabled={count < 1 || disabled}
            sx={{ minWidth: '85px', marginLeft: '10px' }}
          >
            Add
          </Button>
        )}
      </StyledInputOuter>
    </Grid>
  );
  return (
    <React.Fragment key={`tabbed-panel-${idx}`}>
      {/* Displays Table Row for larger screens */}
      <Hidden mdDown>
        <StyledDisabledTableRow
          data-qa-plan-row={type.formattedLabel}
          key={type.id}
          disabled={disabled}
        >
          <TableCell data-qa-plan-name>{type.heading}</TableCell>
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
            <StyledInputOuter>
              <EnhancedNumberInput
                inputLabel={`edit-quantity-${type.id}`}
                value={count}
                setValue={(newCount: number) =>
                  updatePlanCount(type.id, newCount)
                }
                disabled={
                  // When on the add pool flow, we only want the current input to be active,
                  // unless we've just landed on the form or all the inputs are empty.
                  (!onAdd && Boolean(selectedID) && type.id !== selectedID) ||
                  disabled
                }
              />
              {onAdd && (
                <Button
                  buttonType="primary"
                  onClick={() => onAdd(type.id, count)}
                  disabled={count < 1 || disabled}
                  sx={{ minWidth: '85px', marginLeft: '10px' }}
                >
                  Add
                </Button>
              )}
            </StyledInputOuter>
          </TableCell>
        </StyledDisabledTableRow>
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

const StyledInputOuter = styled('div', { label: 'StyledInputOuter' })(
  ({ theme }) => ({
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'flex-end',
    [theme.breakpoints.down('md')]: {
      justifyContent: 'flex-start',
    },
  })
);
