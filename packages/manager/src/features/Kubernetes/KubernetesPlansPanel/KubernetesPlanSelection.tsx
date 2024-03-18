import { PriceObject } from '@linode/api-v4';
import { Region } from '@linode/api-v4/lib/regions';
import HelpOutline from '@mui/icons-material/HelpOutline';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';

import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button/Button';
import { Chip } from 'src/components/Chip';
import { EnhancedNumberInput } from 'src/components/EnhancedNumberInput/EnhancedNumberInput';
import { Hidden } from 'src/components/Hidden';
import { IconButton } from 'src/components/IconButton';
import { SelectionCard } from 'src/components/SelectionCard/SelectionCard';
import { TableCell } from 'src/components/TableCell';
import { Tooltip } from 'src/components/Tooltip';
import { LIMITED_AVAILABILITY_TEXT } from 'src/features/components/PlansPanel/constants';
import { StyledDisabledTableRow } from 'src/features/components/PlansPanel/PlansPanel.styles';
import { useFlags } from 'src/hooks/useFlags';
import {
  PRICE_ERROR_TOOLTIP_TEXT,
  UNKNOWN_PRICE,
} from 'src/utilities/pricing/constants';
import { renderMonthlyPriceToCorrectDecimalPlace } from 'src/utilities/pricing/dynamicPricing';
import { getLinodeRegionPrice } from 'src/utilities/pricing/linodes';
import { convertMegabytesTo } from 'src/utilities/unitConversions';

import type { TypeWithAvailability } from 'src/features/components/PlansPanel/types';

export interface KubernetesPlanSelectionProps {
  disabled?: boolean;
  getTypeCount: (planId: string) => number;
  idx: number;
  isLimitedAvailabilityPlan: boolean;
  onAdd?: (key: string, value: number) => void;
  onSelect: (key: string) => void;
  selectedId?: string;
  selectedRegionId?: Region['id'];
  type: TypeWithAvailability;
  updatePlanCount: (planId: string, newCount: number) => void;
}

export const KubernetesPlanSelection = (
  props: KubernetesPlanSelectionProps
) => {
  const {
    disabled,
    getTypeCount,
    idx,
    isLimitedAvailabilityPlan,
    onAdd,
    onSelect,
    selectedId,
    selectedRegionId,
    type,
    updatePlanCount,
  } = props;

  const flags = useFlags();

  // Determine if the plan should be disabled solely due to being a 512GB plan
  const disabled512GbPlan =
    type.label.includes('512GB') &&
    Boolean(flags.disableLargestGbPlans) &&
    !disabled;
  const isDisabled = disabled || isLimitedAvailabilityPlan || disabled512GbPlan;
  const count = getTypeCount(type.id);
  const price: PriceObject | undefined = getLinodeRegionPrice(
    type,
    selectedRegionId
  );

  // We don't want flat-rate pricing or network information for LKE so we select only the second type element.
  const subHeadings = [
    `$${renderMonthlyPriceToCorrectDecimalPlace(price?.monthly)}/mo ($${
      price?.hourly
    }/hr)`,
    type.subHeadings[1],
  ];

  const renderVariant = () => (
    <Grid xs={12}>
      <StyledInputOuter>
        <EnhancedNumberInput
          disabled={isDisabled}
          setValue={(newCount: number) => updatePlanCount(type.id, newCount)}
          value={count}
        />
        {onAdd && (
          <Button
            disabled={
              count < 1 ||
              disabled ||
              isLimitedAvailabilityPlan ||
              disabled512GbPlan
            }
            buttonType="primary"
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
          disabled={isDisabled}
          key={type.id}
        >
          <TableCell data-qa-plan-name>
            <Box alignItems="center">
              {type.heading} &nbsp;
              {(isLimitedAvailabilityPlan || disabled512GbPlan) && (
                <Tooltip
                  sx={{
                    alignItems: 'center',
                  }}
                  data-qa-tooltip={LIMITED_AVAILABILITY_TEXT}
                  data-testid="limited-availability"
                  placement="right-start"
                  title={LIMITED_AVAILABILITY_TEXT}
                >
                  <IconButton disableRipple size="small">
                    <HelpOutline
                      sx={{
                        height: 16,
                        width: 16,
                      }}
                    />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </TableCell>
          <TableCell
            data-qa-monthly
            errorCell={typeof price?.monthly !== 'number'}
            errorText={!price?.monthly ? PRICE_ERROR_TOOLTIP_TEXT : undefined}
          >
            ${renderMonthlyPriceToCorrectDecimalPlace(price?.monthly)}
          </TableCell>
          <TableCell
            data-qa-hourly
            errorCell={typeof price?.hourly !== 'number'}
            errorText={!price?.hourly ? PRICE_ERROR_TOOLTIP_TEXT : undefined}
          >
            ${price?.hourly ?? UNKNOWN_PRICE}
          </TableCell>
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
                  // unless we've just landed on the form, all the inputs are empty,
                  // or there was a pricing data error.
                  (!onAdd && Boolean(selectedId) && type.id !== selectedId) ||
                  isDisabled ||
                  typeof price?.hourly !== 'number'
                }
                setValue={(newCount: number) =>
                  updatePlanCount(type.id, newCount)
                }
                inputLabel={`edit-quantity-${type.id}`}
                value={count}
              />
              {onAdd && (
                <Button
                  disabled={
                    count < 1 || isDisabled || typeof price?.hourly !== 'number'
                  }
                  buttonType="primary"
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
          subheadings={[
            ...subHeadings,
            isDisabled ? <Chip label="Limited Availability" /> : '',
          ]}
          checked={type.id === String(selectedId)}
          disabled={isDisabled}
          heading={type.heading}
          key={type.id}
          onClick={() => onSelect(type.id)}
          renderVariant={renderVariant}
          tooltip={isDisabled ? LIMITED_AVAILABILITY_TEXT : undefined}
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
