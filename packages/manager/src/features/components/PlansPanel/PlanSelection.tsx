import { Chip, FormControlLabel, Radio } from '@linode/ui';
import { convertMegabytesTo } from '@linode/utilities';
import * as React from 'react';

import { Currency } from 'src/components/Currency';
import { Hidden } from 'src/components/Hidden';
import { SelectionCard } from 'src/components/SelectionCard/SelectionCard';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { LINODE_NETWORK_IN } from 'src/constants';
import { useLinodeQuery } from '@linode/queries';
import {
  PRICE_ERROR_TOOLTIP_TEXT,
  UNKNOWN_PRICE,
} from 'src/utilities/pricing/constants';
import { renderMonthlyPriceToCorrectDecimalPlace } from 'src/utilities/pricing/dynamicPricing';
import { getLinodeRegionPrice } from 'src/utilities/pricing/linodes';

import { DisabledPlanSelectionTooltip } from './DisabledPlanSelectionTooltip';
import { StyledChip, StyledRadioCell } from './PlanSelection.styles';
import { getDisabledPlanReasonCopy } from './utils';

import type { PlanWithAvailability } from './types';
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
  plan: PlanWithAvailability;
  selectedId?: string;
  selectedRegionId?: Region['id'];
  showNetwork?: boolean;
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
    selectedId,
    selectedRegionId,
    showNetwork,
    showTransfer,
    wholePanelIsDisabled,
  } = props;
  const {
    planBelongsToDisabledClass,
    planHasLimitedAvailability,
    planIsDisabled512Gb,
    planIsSmallerThanUsage,
    planIsTooSmall,
  } = plan;

  const isSamePlan = plan.heading === currentPlanHeading;
  const isGPU = plan.class === 'gpu';

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
    (!isDatabaseFlow && isSamePlan) ||
    planIsTooSmall ||
    planIsSmallerThanUsage ||
    planBelongsToDisabledClass ||
    planIsDisabled512Gb ||
    planHasLimitedAvailability ||
    wholePanelIsDisabled;

  const disabledPlanReasonCopy = getDisabledPlanReasonCopy({
    planBelongsToDisabledClass,
    planHasLimitedAvailability,
    planIsDisabled512Gb,
    planIsSmallerThanUsage,
    planIsTooSmall,
    wholePanelIsDisabled,
  });

  // These are the two exceptions for when the tooltip should be hidden
  // - The entire panel is disabled (means the plans class isn't available in the selected region. (The user will see a notice about this)
  // - The majority of plans are disabled - In order to reduce visual clutter, we don't show the tooltip if the majority of plans are disabled (there is also a notice about this)
  // For both, and accessibility is maintained via aria-label on the radio when disabled, so screen readers can still describe the reason why.
  const showDisabledTooltip =
    !wholePanelIsDisabled &&
    !hasMajorityOfPlansDisabled &&
    (planBelongsToDisabledClass ||
      planIsDisabled512Gb ||
      planHasLimitedAvailability ||
      planIsTooSmall ||
      planIsSmallerThanUsage);

  const isDistributedPlan =
    plan.id.includes('dedicated-edge') || plan.id.includes('nanode-edge');

  const networkOutGbps = plan.network_out && plan.network_out / 1000;

  return (
    <React.Fragment key={`tabbed-panel-${idx}`}>
      {/* Displays Table Row for larger screens */}
      <Hidden lgDown={isCreate} mdDown={!isCreate}>
        <TableRow
          className={rowIsDisabled ? 'disabled-row' : ''}
          data-qa-plan-row={plan.formattedLabel}
          key={plan.id}
          onClick={() => (!rowIsDisabled ? onSelect(plan.id) : undefined)}
          selected={Boolean(plan.id === String(selectedId))}
        >
          <StyledRadioCell>
            {(!isSamePlan || (isDatabaseFlow && isSamePlan)) && (
              <FormControlLabel
                aria-label={`${plan.heading} ${
                  rowIsDisabled ? `- ${disabledPlanReasonCopy}` : ''
                }`}
                control={
                  <Radio
                    checked={
                      !wholePanelIsDisabled &&
                      !rowIsDisabled &&
                      plan.id === String(selectedId)
                    }
                    disabled={
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
          {showTransfer ? (
            <TableCell center data-qa-transfer>
              {plan.transfer !== undefined ? (
                <>{plan.transfer / 1000} TB</>
              ) : (
                ''
              )}
            </TableCell>
          ) : null}
          {showNetwork ? (
            <TableCell center data-qa-network noWrap>
              {plan.network_out ? (
                <>
                  {isDistributedPlan ? networkOutGbps : LINODE_NETWORK_IN} Gbps{' '}
                  <span style={{ color: '#9DA4A6' }}>/</span> {networkOutGbps}{' '}
                  Gbps
                </>
              ) : (
                ''
              )}
            </TableCell>
          ) : null}
        </TableRow>
      </Hidden>

      {/* Displays SelectionCard for small screens */}
      <Hidden lgUp={isCreate} mdUp={!isCreate}>
        <SelectionCard
          disabled={
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
            planHasLimitedAvailability || planIsDisabled512Gb ? (
              <Chip label="Limited Deployment Availability" />
            ) : (
              ''
            ),
          ]}
          checked={plan.id === String(selectedId)}
          heading={plan.heading}
          key={plan.id}
          onClick={() => onSelect(plan.id)}
          tooltip={rowIsDisabled ? disabledPlanReasonCopy : undefined}
        />
      </Hidden>
    </React.Fragment>
  );
};
