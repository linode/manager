import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { Button } from 'src/components/Button/Button';
import { EnhancedNumberInput } from 'src/components/EnhancedNumberInput/EnhancedNumberInput';
import { Hidden } from 'src/components/Hidden';
import { SelectionCard } from 'src/components/SelectionCard/SelectionCard';
import { TableCell } from 'src/components/TableCell';
import { StyledDisabledTableRow } from 'src/features/components/PlansPanel/PlansPanel.styles';
import { ExtendedType } from 'src/utilities/extendType';
import { convertMegabytesTo } from 'src/utilities/unitConversions';

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
          disabled={disabled}
          setValue={(newCount: number) => updatePlanCount(type.id, newCount)}
          value={count}
        />
        {onAdd && (
          <Button
            buttonType="primary"
            disabled={count < 1 || disabled}
            onClick={() => onAdd(type.id, count)}
            sx={{ marginLeft: '10px', minWidth: '85px' }}
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
          disabled={disabled}
          key={type.id}
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
                disabled={
                  // When on the add pool flow, we only want the current input to be active,
                  // unless we've just landed on the form or all the inputs are empty.
                  (!onAdd && Boolean(selectedID) && type.id !== selectedID) ||
                  disabled
                }
                setValue={(newCount: number) =>
                  updatePlanCount(type.id, newCount)
                }
                inputLabel={`edit-quantity-${type.id}`}
                value={count}
              />
              {onAdd && (
                <Button
                  buttonType="primary"
                  disabled={count < 1 || disabled}
                  onClick={() => onAdd(type.id, count)}
                  sx={{ marginLeft: '10px', minWidth: '85px' }}
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
          checked={type.id === String(selectedID)}
          disabled={disabled}
          heading={type.heading}
          key={type.id}
          onClick={() => onSelect(type.id)}
          renderVariant={renderVariant}
          subheadings={subHeadings}
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
