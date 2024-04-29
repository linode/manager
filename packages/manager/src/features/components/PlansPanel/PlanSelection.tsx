import * as React from 'react';

import { Chip } from 'src/components/Chip';
import { Currency } from 'src/components/Currency';
import { FormControlLabel } from 'src/components/FormControlLabel';
import { Hidden } from 'src/components/Hidden';
import { Radio } from 'src/components/Radio/Radio';
import { SelectionCard } from 'src/components/SelectionCard/SelectionCard';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { LINODE_NETWORK_IN } from 'src/constants';
import { useLinodeQuery } from 'src/queries/linodes/linodes';
import {
  PRICE_ERROR_TOOLTIP_TEXT,
  UNKNOWN_PRICE,
} from 'src/utilities/pricing/constants';
import { renderMonthlyPriceToCorrectDecimalPlace } from 'src/utilities/pricing/dynamicPricing';
import { getLinodeRegionPrice } from 'src/utilities/pricing/linodes';
import { convertMegabytesTo } from 'src/utilities/unitConversions';

import { DisabledPlanSelectionTooltip } from './DisabledPlanSelectionTooltip';
import { StyledChip, StyledRadioCell } from './PlanSelection.styles';
import { getDisabledPlanReasonCopy } from './utils';

import type { TypeWithAvailability } from './types';
import type { LinodeTypeClass, PriceObject, Region } from '@linode/api-v4';

export interface PlanSelectionProps {
  currentPlanHeading?: string;
  disabledClasses?: LinodeTypeClass[];
  hasMajorityOfPlansDisabled: boolean;
  header?: string;
  idx: number;
  isCreate?: boolean;
  linodeID?: number | undefined;
  onSelect: (key: string) => void;
  plan: TypeWithAvailability;
  selectedDiskSize?: number;
  selectedId?: string;
  selectedRegionId?: Region['id'];
  showTransfer?: boolean;
  wholePanelIsDisabled?: boolean;
}

export const PlanSelection = (props: PlanSelectionProps) => {
  const {
    currentPlanHeading,
    hasMajorityOfPlansDisabled,
    idx,
    isCreate,
    linodeID,
    onSelect,
    plan,
    selectedDiskSize,
    selectedId,
    selectedRegionId,
    showTransfer,
    wholePanelIsDisabled,
  } = props;
  const {
    planBelongsToDisabledClass,
    planHasLimitedAvailability,
    planIs512Gb,
  } = plan;

  const diskSize = selectedDiskSize ? selectedDiskSize : 0;
  const planIsTooSmall = diskSize > plan.disk;
  const isSamePlan = plan.heading === currentPlanHeading;
  const isGPU = plan.class === 'gpu';
  const shouldShowTransfer = showTransfer && plan.transfer;
  const shouldShowNetwork = showTransfer && plan.network_out;

  const { data: linode } = useLinodeQuery(
    linodeID ?? -1,
    linodeID !== undefined
  );
  const selectedLinodePlanType = linode?.type;

  // DC Dynamic price logic - DB creation and DB resize flows are currently out of scope
  const isDatabaseFlow = location.pathname.includes('/databases');
  const price: PriceObject | undefined = !isDatabaseFlow
    ? getLinodeRegionPrice(plan, selectedRegionId)
    : plan.price;
  plan.subHeadings[0] = `$${renderMonthlyPriceToCorrectDecimalPlace(
    price?.monthly
  )}/mo ($${price?.hourly ?? UNKNOWN_PRICE}/hr)`;

  const rowIsDisabled =
    isSamePlan ||
    planIsTooSmall ||
    planBelongsToDisabledClass ||
    planIs512Gb ||
    planHasLimitedAvailability ||
    wholePanelIsDisabled;

  const disabledPlanReasonCopy = getDisabledPlanReasonCopy({
    planBelongsToDisabledClass,
    planIsTooSmall,
    wholePanelIsDisabled,
  });

  // These are the two exceptions for when the tooltip should be hidden
  // - The entire panel is disabled (means the plans class isn't available in the selected region. (The user will see a notice about this)
  // - The majority of plans are disabled - In order to reduce visual clutter, we don't show the tooltip if the majority of plans are disabled (there is also a notice about this)
  // For both, and accessibility is maintained via ariaDescribedBy so screen readers can still describe why each radio is disabled.
  const showDisabledTooltip =
    !wholePanelIsDisabled &&
    !hasMajorityOfPlansDisabled &&
    (planBelongsToDisabledClass ||
      planIs512Gb ||
      planHasLimitedAvailability ||
      planIsTooSmall);
  const showAccessibleDisabledReason =
    planBelongsToDisabledClass ||
    planIs512Gb ||
    planHasLimitedAvailability ||
    wholePanelIsDisabled ||
    planIsTooSmall;

  return (
    <React.Fragment key={`tabbed-panel-${idx}`}>
      {/* Displays Table Row for larger screens */}
      <Hidden lgDown={isCreate} mdDown={!isCreate}>
        <TableRow
          className={rowIsDisabled ? 'disabled-row' : ''}
          data-qa-plan-row={plan.formattedLabel}
          key={plan.id}
          onClick={() => (!rowIsDisabled ? onSelect(plan.id) : undefined)}
        >
          <StyledRadioCell>
            {!isSamePlan && (
              <FormControlLabel
                aria-label={`${plan.heading} ${
                  showAccessibleDisabledReason
                    ? `- ${disabledPlanReasonCopy}`
                    : ''
                }`}
                control={
                  <Radio
                    checked={
                      !wholePanelIsDisabled &&
                      !rowIsDisabled &&
                      !planIsTooSmall &&
                      plan.id === String(selectedId)
                    }
                    disabled={
                      planIsTooSmall ||
                      wholePanelIsDisabled ||
                      rowIsDisabled ||
                      planBelongsToDisabledClass
                    }
                    id={plan.id}
                    onChange={() => onSelect(plan.id)}
                  />
                }
                className={'label-visually-hidden'}
                label={plan.heading}
              />
            )}
          </StyledRadioCell>
          <TableCell
            className={rowIsDisabled ? 'hasTooltip' : ''}
            data-qa-plan-name
          >
            {plan.heading} &nbsp;
            {showDisabledTooltip && (
              <DisabledPlanSelectionTooltip
                tooltipCopy={disabledPlanReasonCopy}
              />
            )}
            {(isSamePlan || plan.id === selectedLinodePlanType) && (
              <StyledChip
                aria-label="This is your current plan"
                data-qa-current-plan
                label="Current Plan"
              />
            )}
          </TableCell>
          <TableCell
            data-qa-monthly
            errorCell={typeof price?.monthly !== 'number'}
            errorText={!price?.monthly ? PRICE_ERROR_TOOLTIP_TEXT : undefined}
          >
            {' '}
            ${renderMonthlyPriceToCorrectDecimalPlace(price?.monthly)}
          </TableCell>
          <TableCell
            data-qa-hourly
            errorCell={typeof price?.hourly !== 'number'}
            errorText={!price?.hourly ? PRICE_ERROR_TOOLTIP_TEXT : undefined}
          >
            {isGPU ? (
              <Currency quantity={price?.hourly ?? UNKNOWN_PRICE} />
            ) : (
              `$${price?.hourly ?? UNKNOWN_PRICE}`
            )}
          </TableCell>
          <TableCell center data-qa-ram noWrap>
            {convertMegabytesTo(plan.memory, true)}
          </TableCell>
          <TableCell center data-qa-cpu>
            {plan.vcpus}
          </TableCell>
          <TableCell center data-qa-storage noWrap>
            {convertMegabytesTo(plan.disk, true)}
          </TableCell>
          {shouldShowTransfer && plan.transfer ? (
            <TableCell center data-qa-transfer>
              {plan.transfer / 1000} TB
            </TableCell>
          ) : null}
          {shouldShowNetwork && plan.network_out ? (
            <TableCell center data-qa-network noWrap>
              {LINODE_NETWORK_IN} Gbps{' '}
              <span style={{ color: '#9DA4A6' }}>/</span>{' '}
              {plan.network_out / 1000} Gbps
            </TableCell>
          ) : null}
        </TableRow>
      </Hidden>

      {/* Displays SelectionCard for small screens */}
      <Hidden lgUp={isCreate} mdUp={!isCreate}>
        <SelectionCard
          disabled={
            planIsTooSmall ||
            isSamePlan ||
            wholePanelIsDisabled ||
            rowIsDisabled ||
            planBelongsToDisabledClass
          }
          headingDecoration={
            isSamePlan || plan.id === selectedLinodePlanType ? (
              <StyledChip
                aria-label="This is your current plan"
                data-qa-current-plan
                label="Current Plan"
              />
            ) : undefined
          }
          subheadings={[
            ...plan.subHeadings,
            rowIsDisabled ? (
              <Chip label="Limited Deployment Availability" />
            ) : (
              ''
            ),
          ]}
          sxTooltip={{
            // There's no easy way to override the margin or transform due to inline styles and existing specificity rules.
            transform: 'translate(-10px, 20px) !important',
          }}
          checked={plan.id === String(selectedId)}
          heading={plan.heading}
          key={plan.id}
          onClick={() => onSelect(plan.id)}
          // tooltip={rowIsDisabled ? LIMITED_AVAILABILITY_TEXT : ''}
        />
      </Hidden>
    </React.Fragment>
  );
};
