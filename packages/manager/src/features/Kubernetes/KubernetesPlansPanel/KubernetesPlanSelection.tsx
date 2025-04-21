import { Box, Button, Chip } from '@linode/ui';
import { convertMegabytesTo } from '@linode/utilities';
import Grid from '@mui/material/Grid2';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { EnhancedNumberInput } from 'src/components/EnhancedNumberInput/EnhancedNumberInput';
import { Hidden } from 'src/components/Hidden';
import { SelectionCard } from 'src/components/SelectionCard/SelectionCard';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { DisabledPlanSelectionTooltip } from 'src/features/components/PlansPanel/DisabledPlanSelectionTooltip';
import { getDisabledPlanReasonCopy } from 'src/features/components/PlansPanel/utils';
import {
  MAX_NODES_PER_POOL_ENTERPRISE_TIER,
  MAX_NODES_PER_POOL_STANDARD_TIER,
} from 'src/features/Kubernetes/constants';
import {
  PRICE_ERROR_TOOLTIP_TEXT,
  UNKNOWN_PRICE,
} from 'src/utilities/pricing/constants';
import { renderMonthlyPriceToCorrectDecimalPlace } from 'src/utilities/pricing/dynamicPricing';
import { getLinodeRegionPrice } from 'src/utilities/pricing/linodes';

import type { KubernetesTier, PriceObject } from '@linode/api-v4';
import type { Region } from '@linode/api-v4/lib/regions';
import type { PlanWithAvailability } from 'src/features/components/PlansPanel/types';

export interface KubernetesPlanSelectionProps {
  getTypeCount: (planId: string) => number;
  hasMajorityOfPlansDisabled: boolean;
  idx: number;
  onAdd?: (key: string, value: number) => void;
  onSelect: (key: string) => void;
  plan: PlanWithAvailability;
  selectedId?: string;
  selectedRegionId?: Region['id'];
  selectedTier: KubernetesTier;
  updatePlanCount: (planId: string, newCount: number) => void;
  wholePanelIsDisabled: boolean;
}
export const KubernetesPlanSelection = (
  props: KubernetesPlanSelectionProps
) => {
  const {
    getTypeCount,
    hasMajorityOfPlansDisabled,
    idx,
    onAdd,
    onSelect,
    plan,
    selectedId,
    selectedRegionId,
    selectedTier,
    updatePlanCount,
    wholePanelIsDisabled,
  } = props;
  const {
    planBelongsToDisabledClass,
    planHasLimitedAvailability,
    planIsDisabled512Gb,
    planIsTooSmallForAPL,
  } = plan;

  const rowIsDisabled =
    wholePanelIsDisabled ||
    planHasLimitedAvailability ||
    planIsDisabled512Gb ||
    planIsTooSmallForAPL;
  const count = getTypeCount(plan.id);
  const price: PriceObject | undefined = getLinodeRegionPrice(
    plan,
    selectedRegionId
  );

  const disabledPlanReasonCopy = getDisabledPlanReasonCopy({
    planBelongsToDisabledClass,
    planHasLimitedAvailability,
    planIsDisabled512Gb,
    // So far, planIsTooSmall only applies to DbaaS plans (resize)
    planIsTooSmall: false,
    planIsTooSmallForAPL,
    wholePanelIsDisabled,
  });

  // These are the two exceptions for when the tooltip should be hidden
  // - The entire panel is disabled (means the plans class isn't available in the selected region. (The user will see a notice about this)
  // - The majority of plans are disabled - In order to reduce visual clutter, we don't show the tooltip if the majority of plans are disabled (there is also a notice about this)
  // For both, and accessibility is maintained via aria-label on the add button when disabled, so screen readers can still describe the reason why.
  const showDisabledTooltip =
    !wholePanelIsDisabled &&
    !hasMajorityOfPlansDisabled &&
    (planBelongsToDisabledClass ||
      planIsDisabled512Gb ||
      planIsTooSmallForAPL ||
      planHasLimitedAvailability);

  // We don't want flat-rate pricing or network information for LKE so we select only the second type element.
  const subHeadings = [
    `$${renderMonthlyPriceToCorrectDecimalPlace(price?.monthly)}/mo ($${
      price?.hourly
    }/hr)`,
    plan.subHeadings[1],
  ];

  const renderVariant = () => (
    <Grid size={12}>
      <StyledInputOuter>
        <EnhancedNumberInput
          disabled={rowIsDisabled}
          max={
            selectedTier === 'enterprise'
              ? MAX_NODES_PER_POOL_ENTERPRISE_TIER
              : MAX_NODES_PER_POOL_STANDARD_TIER
          }
          setValue={(newCount: number) => updatePlanCount(plan.id, newCount)}
          value={count}
        />
        {onAdd && (
          <Button
            buttonType="primary"
            disabled={count < 1 || rowIsDisabled}
            onClick={() => onAdd(plan.id, count)}
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
        <TableRow
          className={rowIsDisabled ? 'disabled-row' : ''}
          data-qa-plan-row={plan.formattedLabel}
          disabled={rowIsDisabled}
          key={plan.id}
        >
          <TableCell data-qa-plan-name>
            <Box alignItems="center">
              {plan.heading} &nbsp;
              {showDisabledTooltip && (
                <DisabledPlanSelectionTooltip
                  tooltipCopy={disabledPlanReasonCopy}
                />
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
            {convertMegabytesTo(plan.memory, true)}
          </TableCell>
          <TableCell center data-qa-cpu>
            {plan.vcpus}
          </TableCell>
          <TableCell center data-qa-storage>
            {convertMegabytesTo(plan.disk, true)}
          </TableCell>
          <TableCell>
            <StyledInputOuter>
              <EnhancedNumberInput
                disabled={
                  // When on the add pool flow, we only want the current input to be active,
                  // unless we've just landed on the form, all the inputs are empty,
                  // or there was a pricing data error.
                  (!onAdd && Boolean(selectedId) && plan.id !== selectedId) ||
                  rowIsDisabled ||
                  typeof price?.hourly !== 'number'
                }
                inputLabel={`edit-quantity-${plan.id}`}
                max={
                  selectedTier === 'enterprise'
                    ? MAX_NODES_PER_POOL_ENTERPRISE_TIER
                    : MAX_NODES_PER_POOL_STANDARD_TIER
                }
                setValue={(newCount: number) =>
                  updatePlanCount(plan.id, newCount)
                }
                value={count}
              />
              {onAdd && (
                <Button
                  aria-label={
                    rowIsDisabled ? disabledPlanReasonCopy : undefined
                  }
                  disabled={
                    count < 1 ||
                    rowIsDisabled ||
                    typeof price?.hourly !== 'number'
                  }
                  buttonType="primary"
                  onClick={() => onAdd(plan.id, count)}
                  sx={{ marginLeft: '10px', minWidth: '85px' }}
                >
                  Add
                </Button>
              )}
            </StyledInputOuter>
          </TableCell>
        </TableRow>
      </Hidden>
      {/* Displays SelectionCard for small screens */}
      <Hidden mdUp>
        <SelectionCard
          subheadings={[
            ...subHeadings,
            planHasLimitedAvailability || planIsDisabled512Gb ? (
              <Chip label="Limited Deployment Availability" />
            ) : (
              ''
            ),
          ]}
          checked={plan.id === String(selectedId)}
          disabled={rowIsDisabled}
          heading={plan.heading}
          key={plan.id}
          onClick={() => onSelect(plan.id)}
          renderVariant={renderVariant}
          tooltip={rowIsDisabled ? disabledPlanReasonCopy : undefined}
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
