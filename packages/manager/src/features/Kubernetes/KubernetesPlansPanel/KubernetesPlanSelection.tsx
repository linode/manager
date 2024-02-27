import { PriceObject } from '@linode/api-v4';
import { Region } from '@linode/api-v4/lib/regions';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';

import { Button } from 'src/components/Button/Button';
import { Chip } from 'src/components/Chip';
import { EnhancedNumberInput } from 'src/components/EnhancedNumberInput/EnhancedNumberInput';
import { Hidden } from 'src/components/Hidden';
import { SelectionCard } from 'src/components/SelectionCard/SelectionCard';
import { TableCell } from 'src/components/TableCell';
import { Tooltip } from 'src/components/Tooltip';
import { PLAN_IS_SOLD_OUT_COPY } from 'src/constants';
import { UnavailableMessageFor512GbPlans } from 'src/features/components/PlansPanel/PlanSelection';
import { StyledDisabledTableRow } from 'src/features/components/PlansPanel/PlansPanel.styles';
import { useFlags } from 'src/hooks/useFlags';
import { ExtendedType } from 'src/utilities/extendType';
import {
  PRICE_ERROR_TOOLTIP_TEXT,
  UNKNOWN_PRICE,
} from 'src/utilities/pricing/constants';
import { renderMonthlyPriceToCorrectDecimalPlace } from 'src/utilities/pricing/dynamicPricing';
import { getLinodeRegionPrice } from 'src/utilities/pricing/linodes';
import { convertMegabytesTo } from 'src/utilities/unitConversions';

export interface KubernetesPlanSelectionProps {
  disabled?: boolean;
  getTypeCount: (planId: string) => number;
  idx: number;
  isPlanSoldOut: boolean;
  onAdd?: (key: string, value: number) => void;
  onSelect: (key: string) => void;
  selectedId?: string;
  selectedRegionId?: Region['id'];
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
    isPlanSoldOut,
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
    !isPlanSoldOut &&
    !disabled;

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
          disabled={disabled || isPlanSoldOut || disabled512GbPlan}
          setValue={(newCount: number) => updatePlanCount(type.id, newCount)}
          value={count}
        />
        {onAdd && (
          <Button
            disabled={
              count < 1 || disabled || isPlanSoldOut || disabled512GbPlan
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
          disabled={disabled || isPlanSoldOut || disabled512GbPlan}
          key={type.id}
        >
          <TableCell data-qa-plan-name>
            {type.heading} &nbsp;
            {(isPlanSoldOut || disabled512GbPlan) && (
              <Tooltip
                title={
                  disabled512GbPlan ? (
                    <UnavailableMessageFor512GbPlans type={type} />
                  ) : (
                    PLAN_IS_SOLD_OUT_COPY
                  )
                }
                data-testid="sold-out-chip"
                placement="right-start"
              >
                <span>
                  <Chip label="Sold Out" />
                </span>
              </Tooltip>
            )}
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
                  disabled ||
                  typeof price?.hourly !== 'number' ||
                  isPlanSoldOut ||
                  disabled512GbPlan
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
                    count < 1 ||
                    disabled ||
                    typeof price?.hourly !== 'number' ||
                    isPlanSoldOut ||
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
          </TableCell>
        </StyledDisabledTableRow>
      </Hidden>
      {/* Displays SelectionCard for small screens */}
      <Hidden mdUp>
        <SelectionCard
          subheadings={[
            ...subHeadings,
            isPlanSoldOut ? <Chip label="Sold Out" /> : '',
          ]}
          tooltip={
            disabled512GbPlan && !isPlanSoldOut ? (
              <UnavailableMessageFor512GbPlans type={type} />
            ) : isPlanSoldOut ? (
              PLAN_IS_SOLD_OUT_COPY
            ) : undefined
          }
          checked={type.id === String(selectedId)}
          disabled={disabled || isPlanSoldOut || disabled512GbPlan}
          heading={type.heading}
          key={type.id}
          onClick={() => onSelect(type.id)}
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
