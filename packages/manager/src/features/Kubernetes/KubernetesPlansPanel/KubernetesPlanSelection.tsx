import { PriceObject } from '@linode/api-v4';
import { Region } from '@linode/api-v4/lib/regions';
import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { Button } from 'src/components/Button/Button';
import { EnhancedNumberInput } from 'src/components/EnhancedNumberInput/EnhancedNumberInput';
import { Hidden } from 'src/components/Hidden';
import { SelectionCard } from 'src/components/SelectionCard/SelectionCard';
import { TableCell } from 'src/components/TableCell';
import { StyledDisabledTableRow } from 'src/features/components/PlansPanel/PlansPanel.styles';
import { useFlags } from 'src/hooks/useFlags';
import { ExtendedType } from 'src/utilities/extendType';
import { getLinodeRegionPrice } from 'src/utilities/pricing/linodes';
import { convertMegabytesTo } from 'src/utilities/unitConversions';

export interface KubernetesPlanSelectionProps {
  disabled?: boolean;
  getTypeCount: (planId: string) => number;
  idx: number;
  onAdd?: (key: string, value: number) => void;
  onSelect: (key: string) => void;
  selectedID?: string;
  selectedRegionID?: Region['id'];
  type: ExtendedType;
  updatePlanCount: (planId: string, newCount: number) => void;
}

export const KubernetesPlanSelection = (
  props: KubernetesPlanSelectionProps
) => {
  const {
    disabled,
    getTypeCount,
    idx,
    onAdd,
    onSelect,
    selectedID,
    selectedRegionID,
    type,
    updatePlanCount,
  } = props;

  const flags = useFlags();

  const count = getTypeCount(type.id);

  const price: PriceObject =
    flags.dcSpecificPricing && selectedRegionID
      ? getLinodeRegionPrice(type, selectedRegionID)
      : type.price;

  // We don't want flat-rate pricing or network information for LKE so we select only the second type element.
  const subHeadings = [
    `$${price.monthly?.toFixed(2)}/mo ($${price.hourly}/hr)`,
    type.subHeadings[1],
  ];

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
          <TableCell data-qa-monthly> ${price.monthly?.toFixed(2)}</TableCell>
          <TableCell data-qa-hourly>${price.hourly}</TableCell>
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
