import HelpOutline from '@mui/icons-material/HelpOutline';
import * as React from 'react';

import { Chip } from 'src/components/Chip';
import { Currency } from 'src/components/Currency';
import { FormControlLabel } from 'src/components/FormControlLabel';
import { Hidden } from 'src/components/Hidden';
import { IconButton } from 'src/components/IconButton';
import { Radio } from 'src/components/Radio/Radio';
import { SelectionCard } from 'src/components/SelectionCard/SelectionCard';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { Tooltip } from 'src/components/Tooltip';
import { TooltipIcon } from 'src/components/TooltipIcon';
import { LINODE_NETWORK_IN } from 'src/constants';
import { useLinodeQuery } from 'src/queries/linodes/linodes';
import {
  PRICE_ERROR_TOOLTIP_TEXT,
  UNKNOWN_PRICE,
} from 'src/utilities/pricing/constants';
import { renderMonthlyPriceToCorrectDecimalPlace } from 'src/utilities/pricing/dynamicPricing';
import { getLinodeRegionPrice } from 'src/utilities/pricing/linodes';
import { convertMegabytesTo } from 'src/utilities/unitConversions';

import { LIMITED_AVAILABILITY_TEXT } from './constants';
import { StyledChip, StyledRadioCell } from './PlanSelection.styles';

import type { TypeWithAvailability } from './types';
import type { LinodeTypeClass, PriceObject, Region } from '@linode/api-v4';

export interface PlanSelectionProps {
  currentPlanHeading?: string;
  disabledClasses?: LinodeTypeClass[];
  disabledToolTip?: string;
  header?: string;
  idx: number;
  isCreate?: boolean;
  isWholePanelDisabled?: boolean;
  linodeID?: number | undefined;
  onSelect: (key: string) => void;
  plan: TypeWithAvailability;
  selectedDiskSize?: number;
  selectedId?: string;
  selectedRegionId?: Region['id'];
  showTransfer?: boolean;
}

const getToolTip = ({
  disabledToolTip,
  isSamePlan,
  planIsDisabled,
  sizeTooSmall,
}: {
  disabledToolTip?: string;
  isSamePlan: boolean;
  planIsDisabled?: boolean;
  sizeTooSmall: boolean;
}) => {
  if (planIsDisabled && !isSamePlan) {
    return disabledToolTip;
  }
  if (sizeTooSmall) {
    return 'This plan is too small for the selected image.';
  }
  return undefined;
};

export const PlanSelection = (props: PlanSelectionProps) => {
  const {
    currentPlanHeading,
    disabledToolTip,
    idx,
    isCreate,
    isWholePanelDisabled,
    linodeID,
    onSelect,
    plan,
    selectedDiskSize,
    selectedId,
    selectedRegionId,
    showTransfer,
  } = props;
  const {
    belongsToDisabledClass,
    isDisabled512GbPlan,
    isLimitedAvailabilityPlan,
    isManuallyDisabled,
  } = plan;

  const diskSize = selectedDiskSize ? selectedDiskSize : 0;
  const planTooSmall = diskSize > plan.disk;
  const isSamePlan = plan.heading === currentPlanHeading;
  const tooltip = getToolTip({
    disabledToolTip,
    isSamePlan,
    sizeTooSmall: planTooSmall,
  });
  const isGPU = plan.class === 'gpu';
  const shouldShowTransfer = showTransfer && plan.transfer;
  const shouldShowNetwork = showTransfer && plan.network_out;

  const { data: linode } = useLinodeQuery(
    linodeID ?? -1,
    linodeID !== undefined
  );
  const selectedLinodePlanType = linode?.type;

  const rowAriaLabel =
    plan && plan.formattedLabel && isSamePlan
      ? `${plan.formattedLabel} this is your current plan`
      : planTooSmall
      ? `${plan.formattedLabel} this plan is too small for resize`
      : plan.formattedLabel;

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
    planTooSmall ||
    belongsToDisabledClass ||
    isDisabled512GbPlan ||
    isLimitedAvailabilityPlan ||
    isManuallyDisabled ||
    isWholePanelDisabled;

  return (
    <React.Fragment key={`tabbed-panel-${idx}`}>
      {/* Displays Table Row for larger screens */}
      <Hidden lgDown={isCreate} mdDown={!isCreate}>
        <TableRow
          aria-disabled={rowIsDisabled}
          aria-label={rowAriaLabel}
          data-qa-plan-row={plan.formattedLabel}
          disabled={rowIsDisabled}
          key={plan.id}
          onClick={() => (!rowIsDisabled ? onSelect(plan.id) : undefined)}
        >
          <StyledRadioCell>
            {!isSamePlan && (
              <FormControlLabel
                control={
                  <Radio
                    checked={
                      !isWholePanelDisabled &&
                      !rowIsDisabled &&
                      !planTooSmall &&
                      plan.id === String(selectedId)
                    }
                    disabled={
                      planTooSmall ||
                      isWholePanelDisabled ||
                      rowIsDisabled ||
                      belongsToDisabledClass
                    }
                    id={plan.id}
                    onChange={() => onSelect(plan.id)}
                  />
                }
                aria-label={plan.heading}
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
            {isLimitedAvailabilityPlan && (
              <Tooltip
                PopperProps={{
                  sx: {
                    '& .MuiTooltip-tooltip': {
                      width: 175,
                    },
                  },
                }}
                sx={{
                  top: -2,
                }}
                data-qa-tooltip={LIMITED_AVAILABILITY_TEXT}
                data-testid="limited-availability"
                placement="right"
                title={LIMITED_AVAILABILITY_TEXT}
              >
                <IconButton disableRipple size="small">
                  <HelpOutline
                    sx={{
                      height: 18,
                      width: 18,
                    }}
                  />
                </IconButton>
              </Tooltip>
            )}
            {(isSamePlan || plan.id === selectedLinodePlanType) && (
              <StyledChip
                aria-label="This is your current plan"
                data-qa-current-plan
                label="Current Plan"
              />
            )}
            {tooltip && !isLimitedAvailabilityPlan && (
              <TooltipIcon
                sxTooltipIcon={{
                  paddingBottom: '0px !important',
                  paddingTop: '0px !important',
                  svg: {
                    height: 18,
                    width: 18,
                  },
                  top: -2,
                }}
                status="help"
                text={tooltip}
                tooltipPosition="right"
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
            planTooSmall ||
            isSamePlan ||
            isWholePanelDisabled ||
            rowIsDisabled ||
            belongsToDisabledClass
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
          tooltip={rowIsDisabled ? LIMITED_AVAILABILITY_TEXT : tooltip}
        />
      </Hidden>
    </React.Fragment>
  );
};
