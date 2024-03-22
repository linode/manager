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
import { Tooltip } from 'src/components/Tooltip';
import { TooltipIcon } from 'src/components/TooltipIcon';
import { LINODE_NETWORK_IN } from 'src/constants';
import { useFlags } from 'src/hooks/useFlags';
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
import { StyledDisabledTableRow } from './PlansPanel.styles';

import type { PlanSelectionType } from './types';
import type { LinodeTypeClass, PriceObject, Region } from '@linode/api-v4';

export interface PlanSelectionProps {
  currentPlanHeading?: string;
  disabled?: boolean;
  disabledClasses?: LinodeTypeClass[];
  disabledToolTip?: string;
  header?: string;
  hideDisabledHelpIcons?: boolean;
  idx: number;
  isCreate?: boolean;
  isLimitedAvailabilityPlan: boolean;
  linodeID?: number | undefined;
  onSelect: (key: string) => void;
  planIsDisabled?: boolean;
  selectedDiskSize?: number;
  selectedId?: string;
  selectedRegionId?: Region['id'];
  showTransfer?: boolean;
  type: PlanSelectionType;
}

const getDisabledClass = (
  typeClass: LinodeTypeClass,
  disabledClasses: LinodeTypeClass[]
) => {
  return disabledClasses.includes(typeClass);
};

const getToolTip = ({
  sizeTooSmall,
  planIsDisabled,
  disabledToolTip,
}: {
  sizeTooSmall: boolean;
  planIsDisabled?: boolean;
  disabledToolTip?: string;
}) => {
  if (planIsDisabled) {
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
    disabled,
    disabledClasses,
    hideDisabledHelpIcons,
    disabledToolTip,
    idx,
    isCreate,
    isLimitedAvailabilityPlan,
    linodeID,
    onSelect,
    planIsDisabled,
    selectedDiskSize,
    selectedId,
    selectedRegionId,
    showTransfer,
    type,
  } = props;

  const flags = useFlags();

  // Determine if the plan should be disabled solely due to being a 512GB plan
  const disabled512GbPlan =
    type.label.includes('512GB') &&
    Boolean(flags.disableLargestGbPlans) &&
    !disabled;

  const isDisabled = isLimitedAvailabilityPlan || disabled512GbPlan;

  const diskSize = selectedDiskSize ? selectedDiskSize : 0;
  const planTooSmall = diskSize > type.disk;
  const tooltip = getToolTip({
    sizeTooSmall: planTooSmall,
    planIsDisabled: planIsDisabled,
    disabledToolTip: disabledToolTip,
  });
  const isSamePlan = type.heading === currentPlanHeading;
  const isGPU = type.class === 'gpu';
  const isDisabledClass = getDisabledClass(type.class, disabledClasses ?? []);
  const shouldShowTransfer = showTransfer && type.transfer;
  const shouldShowNetwork = showTransfer && type.network_out;

  const { data: linode } = useLinodeQuery(
    linodeID ?? -1,
    linodeID !== undefined
  );
  const selectedLinodePlanType = linode?.type;

  const rowAriaLabel =
    type && type.formattedLabel && isSamePlan
      ? `${type.formattedLabel} this is your current plan`
      : planTooSmall
      ? `${type.formattedLabel} this plan is too small for resize`
      : type.formattedLabel;

  // DC Dynamic price logic - DB creation and DB resize flows are currently out of scope
  const isDatabaseFlow = location.pathname.includes('/databases');
  const price: PriceObject | undefined = !isDatabaseFlow
    ? getLinodeRegionPrice(type, selectedRegionId)
    : type.price;
  type.subHeadings[0] = `$${renderMonthlyPriceToCorrectDecimalPlace(
    price?.monthly
  )}/mo ($${price?.hourly ?? UNKNOWN_PRICE}/hr)`;

  const rowAriaDisabled =
    isSamePlan || planTooSmall || isDisabledClass || planIsDisabled;

  return (
    <React.Fragment key={`tabbed-panel-${idx}`}>
      {/* Displays Table Row for larger screens */}
      <Hidden lgDown={isCreate} mdDown={!isCreate}>
        <StyledDisabledTableRow
          aria-disabled={rowAriaDisabled}
          disabled={rowAriaDisabled}
          onClick={() =>
            !isSamePlan && !isDisabled && !isDisabledClass && !planTooSmall
              ? onSelect(type.id)
              : undefined
          }
          aria-label={rowAriaLabel}
          data-qa-plan-row={type.formattedLabel}
          key={type.id}
        >
          <StyledRadioCell>
            {!isSamePlan && (
              <FormControlLabel
                control={
                  <Radio
                    checked={
                      !disabled &&
                      !isDisabled &&
                      !planTooSmall &&
                      type.id === String(selectedId)
                    }
                    disabled={
                      planTooSmall || disabled || isDisabled || isDisabledClass
                    }
                    id={type.id}
                    onChange={() => onSelect(type.id)}
                  />
                }
                aria-label={type.heading}
                className={'label-visually-hidden'}
                label={type.heading}
              />
            )}
          </StyledRadioCell>
          <TableCell data-qa-plan-name>
            {type.heading} &nbsp;
            {isDisabled && !hideDisabledHelpIcons && (
              <Tooltip
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
            {(isSamePlan || type.id === selectedLinodePlanType) && (
              <StyledChip
                aria-label="This is your current plan"
                data-qa-current-plan
                label="Current Plan"
              />
            )}
            {tooltip && (
              <TooltipIcon
                sxTooltipIcon={{
                  paddingBottom: '0px !important',
                  paddingTop: '0px !important',
                }}
                status="help"
                text={tooltip}
                tooltipPosition="right-end"
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
            {convertMegabytesTo(type.memory, true)}
          </TableCell>
          <TableCell center data-qa-cpu>
            {type.vcpus}
          </TableCell>
          <TableCell center data-qa-storage noWrap>
            {convertMegabytesTo(type.disk, true)}
          </TableCell>
          {shouldShowTransfer && type.transfer ? (
            <TableCell center data-qa-transfer>
              {type.transfer / 1000} TB
            </TableCell>
          ) : null}
          {shouldShowNetwork && type.network_out ? (
            <TableCell center data-qa-network noWrap>
              {LINODE_NETWORK_IN} Gbps{' '}
              <span style={{ color: '#9DA4A6' }}>/</span>{' '}
              {type.network_out / 1000} Gbps
            </TableCell>
          ) : null}
        </StyledDisabledTableRow>
      </Hidden>

      {/* Displays SelectionCard for small screens */}
      <Hidden lgUp={isCreate} mdUp={!isCreate}>
        <SelectionCard
          disabled={
            planTooSmall ||
            isSamePlan ||
            disabled ||
            isDisabled ||
            isDisabledClass
          }
          headingDecoration={
            isSamePlan || type.id === selectedLinodePlanType ? (
              <StyledChip
                aria-label="This is your current plan"
                data-qa-current-plan
                label="Current Plan"
              />
            ) : undefined
          }
          subheadings={[
            ...type.subHeadings,
            isDisabled ? <Chip label="Limited Availability" /> : '',
          ]}
          sxTooltip={{
            // There's no easy way to override the margin or transform due to inline styles and existing specificity rules.
            transform: 'translate(-10px, 20px) !important',
          }}
          checked={type.id === String(selectedId)}
          heading={type.heading}
          key={type.id}
          onClick={() => onSelect(type.id)}
          tooltip={isDisabled ? LIMITED_AVAILABILITY_TEXT : tooltip}
        />
      </Hidden>
    </React.Fragment>
  );
};
