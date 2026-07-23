import {
  convertMegabytesTo,
  getLinodeRegionPrice,
  UNKNOWN_PRICE,
} from '@akamai/compute-ui-core/api';
import { useLinodeQuery } from '@linode/queries';
import { Chip, FormControlLabel, Radio } from '@linode/ui';
import { Hidden } from '@linode/ui';
import * as React from 'react';

import { Currency } from 'src/components/Currency';
import { SelectionCard } from 'src/components/SelectionCard/SelectionCard';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { LINODE_NETWORK_IN } from 'src/constants';
import { PRICE_ERROR_TOOLTIP_TEXT } from 'src/utilities/pricing/constants';
import { useComputePricing } from 'src/utilities/pricing/useComputePricing';

import { DisabledPlanSelectionTooltip } from './DisabledPlanSelectionTooltip';
import { StyledChip, StyledRadioCell } from './PlanSelection.styles';
import { getMonthlyPriceCellContent } from './shared';
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
  isValkeyEngineSelected?: boolean;
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
    isValkeyEngineSelected,
    wholePanelIsDisabled,
  } = props;
  const {
    planBelongsToDisabledClass,
    planHasLimitedAvailability,
    planIsDisabled512Gb,
    planResizeNotSupported,
    // @TODO remove dbaas resize class type restriction sometime post-release when we support resizing across different plans
    planDBaaSResizeFromPremiumNotSupported,
    planDBaaSResizeToPremiumNotSupported,
    planIsSmallerThanUsage,
  } = plan;

  const isSamePlan = plan.heading === currentPlanHeading;

  // Pass plan.id so the LD flag's activeBillingPlanMatchers can scope the billing mode
  // to specific plan classes (e.g. G8, GPU) without affecting others.
  // This means different rows in the same table can have different billing modes at the same time —
  // scoped plans resolve to 'hourly' while all other plans fall back to 'monthly'.
  const { billing, getPriceSubheading } = useComputePricing(plan.id);

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

  // Hourly-scoped plans show only the hourly price (no monthly commitment).
  // Monthly-scoped plans show the monthly price with the hourly price in parentheses.
  plan.subHeadings[0] = getPriceSubheading(price, { format: 'short' });

  const rowIsDisabled =
    (!isDatabaseFlow && isSamePlan) ||
    planIsSmallerThanUsage ||
    planBelongsToDisabledClass ||
    planIsDisabled512Gb ||
    planHasLimitedAvailability ||
    planResizeNotSupported ||
    // @TODO remove dbaas resize class type restriction sometime post-release when we support resizing across different plans
    (isDatabaseFlow && planDBaaSResizeFromPremiumNotSupported) ||
    (isDatabaseFlow && planDBaaSResizeToPremiumNotSupported) ||
    wholePanelIsDisabled;

  const disabledPlanReasonCopy = getDisabledPlanReasonCopy({
    planBelongsToDisabledClass,
    planHasLimitedAvailability,
    planIsDisabled512Gb,
    planResizeNotSupported,
    // @TODO remove dbaas resize class type restriction sometime post-release when we support resizing across different plans
    planDBaaSResizeFromPremiumNotSupported,
    planDBaaSResizeToPremiumNotSupported,
    planIsSmallerThanUsage,
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
      // @TODO remove dbaas resize class type restriction sometime post-release when we support resizing across different plans
      planDBaaSResizeFromPremiumNotSupported ||
      planDBaaSResizeToPremiumNotSupported ||
      planIsSmallerThanUsage ||
      planResizeNotSupported);

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
                className={'label-visually-hidden'}
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
                    size="small"
                  />
                }
                label={plan.heading}
              />
            )}
          </StyledRadioCell>
          <TableCell
            className={rowIsDisabled ? 'hasTooltip' : ''}
            data-qa-plan-name
            sx={{ paddingLeft: 0.5 }}
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
            errorCell={
              billing === 'monthly' && typeof price?.monthly !== 'number'
            }
            errorText={
              billing === 'monthly' && !price?.monthly
                ? PRICE_ERROR_TOOLTIP_TEXT
                : undefined
            }
          >
            {getMonthlyPriceCellContent(billing, price)}
          </TableCell>
          <TableCell
            data-qa-hourly
            errorCell={typeof price?.hourly !== 'number'}
            errorText={!price?.hourly ? PRICE_ERROR_TOOLTIP_TEXT : undefined}
          >
            <Currency
              quantity={price?.hourly ?? UNKNOWN_PRICE}
              useAdaptivePrecision
            />
          </TableCell>
          <TableCell center data-qa-ram noWrap>
            {convertMegabytesTo(plan.memory, true)}
          </TableCell>
          <TableCell center data-qa-cpu>
            {plan.vcpus}
          </TableCell>
          <TableCell center data-qa-storage noWrap>
            {isValkeyEngineSelected
              ? 'N/A'
              : convertMegabytesTo(plan.disk, true)}
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
          checked={plan.id === String(selectedId)}
          disabled={
            isSamePlan ||
            wholePanelIsDisabled ||
            rowIsDisabled ||
            planBelongsToDisabledClass
          }
          heading={plan.heading}
          headingDecoration={
            isSamePlan || plan.id === selectedLinodePlanType ? (
              <StyledChip
                aria-label="This is your current plan"
                data-qa-current-plan
                label="Current Plan"
              />
            ) : undefined
          }
          key={plan.id}
          onClick={() => onSelect(plan.id)}
          subheadings={[
            ...plan.subHeadings,
            planHasLimitedAvailability || planIsDisabled512Gb ? (
              <Chip label="Limited Deployment Availability" />
            ) : (
              ''
            ),
          ]}
          tooltip={rowIsDisabled ? disabledPlanReasonCopy : undefined}
        />
      </Hidden>
    </React.Fragment>
  );
};
