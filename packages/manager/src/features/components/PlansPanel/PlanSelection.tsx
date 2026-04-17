import { useLinodeQuery } from '@linode/queries';
import { Chip, FormControlLabel, Radio } from '@linode/ui';
import { Hidden } from '@linode/ui';
import { convertMegabytesTo } from '@linode/utilities';
import * as React from 'react';

import { Currency } from 'src/components/Currency';
import { SelectionCard } from 'src/components/SelectionCard/SelectionCard';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { LINODE_NETWORK_IN } from 'src/constants';
import {
  PRICE_ERROR_TOOLTIP_TEXT,
  UNKNOWN_PRICE,
} from 'src/utilities/pricing/constants';
import { getLinodeRegionPrice } from 'src/utilities/pricing/linodes';
import { getDecimalPlaces } from 'src/utilities/pricing/priceInterval';
import {
  formatPriceForInterval,
  getLabelForInterval,
} from 'src/utilities/pricing/priceInterval';
import { useComputePricing } from 'src/utilities/pricing/useComputePricing';

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
    planResizeNotSupported,
    // @TODO remove dbaas resize class type restriction sometime post-release when we support resizing across different plans
    planDBaaSResizeFromPremiumNotSupported,
    planDBaaSResizeToPremiumNotSupported,
    planIsSmallerThanUsage,
    planIsTooSmall,
  } = plan;

  const isSamePlan = plan.heading === currentPlanHeading;

  const { billing } = useComputePricing();

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

  const getSubHeading = (price: PriceObject | undefined): string => {
    const monthlyLabel = getLabelForInterval('monthly');
    const hourlyLabel = getLabelForInterval('hourly');

    const monthly = price?.monthly;
    const hourly = price?.hourly;

    const formattedHourly = `$${formatPriceForInterval(hourly, 'hourly')}/${hourlyLabel}`;
    const formattedMonthly = `$${formatPriceForInterval(monthly, 'monthly')}/${monthlyLabel}`;

    const hasMonthlyPrice = typeof monthly === 'number';

    if (billing === 'hourly') {
      // Do not show monthly price in hourly billing mode when it is null.
      // Even though formatPriceForInterval returns UNKNOWN_PRICE for null values,
      // we avoid displaying it because monthly pricing is not applicable here.
      if (!hasMonthlyPrice) {
        return formattedHourly;
      }

      return `${formattedMonthly} (${formattedHourly})`;
    }

    if (billing === 'monthly') {
      return `${formattedMonthly} (${formattedHourly})`;
    }

    return '';
  };

  plan.subHeadings[0] = getSubHeading(price);

  const rowIsDisabled =
    (!isDatabaseFlow && isSamePlan) ||
    planIsTooSmall ||
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
      // @TODO remove dbaas resize class type restriction sometime post-release when we support resizing across different plans
      planDBaaSResizeFromPremiumNotSupported ||
      planDBaaSResizeToPremiumNotSupported ||
      planIsTooSmall ||
      planIsSmallerThanUsage ||
      planResizeNotSupported);

  const isDistributedPlan =
    plan.id.includes('dedicated-edge') || plan.id.includes('nanode-edge');

  const networkOutGbps = plan.network_out && plan.network_out / 1000;

  const renderMonthlyPriceCell = () => {
    if (typeof price?.monthly === 'number') {
      return (
        <Currency
          decimalPlaces={getDecimalPlaces(price.monthly, 'monthly')}
          quantity={price.monthly}
        />
      );
    }
    if (billing === 'hourly') {
      return 'N/A'; // Not applicable when monthly price is null in Hourly billing mode.
    }
    return null;
  };

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
            {renderMonthlyPriceCell()}
          </TableCell>
          <TableCell
            data-qa-hourly
            errorCell={typeof price?.hourly !== 'number'}
            errorText={!price?.hourly ? PRICE_ERROR_TOOLTIP_TEXT : undefined}
          >
            <Currency
              decimalPlaces={getDecimalPlaces(price?.hourly, 'hourly')}
              quantity={price?.hourly ?? UNKNOWN_PRICE}
            />
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
