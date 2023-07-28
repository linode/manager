import { BaseType, LinodeTypeClass } from '@linode/api-v4/lib/linodes';
import * as React from 'react';

import { Currency } from 'src/components/Currency';
import { Hidden } from 'src/components/Hidden';
import { Radio } from 'src/components/Radio/Radio';
import { SelectionCard } from 'src/components/SelectionCard/SelectionCard';
import { TableCell } from 'src/components/TableCell';
import { TooltipIcon } from 'src/components/TooltipIcon';
import FormControlLabel from 'src/components/core/FormControlLabel';
import { LINODE_NETWORK_IN } from 'src/constants';
import { useLinodeQuery } from 'src/queries/linodes/linodes';
import { ExtendedType } from 'src/utilities/extendType';
import { convertMegabytesTo } from 'src/utilities/unitConversions';

import { StyledChip, StyledRadioCell } from './PlanSelection.styles';
import { StyledDisabledTableRow } from './PlansPanel.styles';

export interface PlanSelectionType extends BaseType {
  class: ExtendedType['class'];
  formattedLabel: ExtendedType['formattedLabel'];
  heading: ExtendedType['heading'];
  network_out?: ExtendedType['network_out'];
  price: ExtendedType['price'];
  subHeadings: ExtendedType['subHeadings'];
  transfer?: ExtendedType['transfer'];
}

interface Props {
  currentPlanHeading?: string;
  disabled?: boolean;
  disabledClasses?: LinodeTypeClass[];
  header?: string;
  idx: number;
  isCreate?: boolean;
  linodeID?: number | undefined;
  onSelect: (key: string) => void;
  selectedDiskSize?: number;
  selectedID?: string;
  showTransfer?: boolean;
  type: PlanSelectionType;
}

const getDisabledClass = (
  typeClass: LinodeTypeClass,
  disabledClasses: LinodeTypeClass[]
) => {
  return disabledClasses.includes(typeClass);
};

export const PlanSelection = ({
  currentPlanHeading,
  disabled,
  disabledClasses,
  idx,
  isCreate,
  linodeID,
  onSelect,
  selectedDiskSize,
  selectedID,
  showTransfer,
  type,
}: Props) => {
  const diskSize = selectedDiskSize ? selectedDiskSize : 0;
  const planTooSmall = diskSize > type.disk;
  const tooltip = planTooSmall
    ? 'This plan is too small for the selected image.'
    : undefined;
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
  return (
    <React.Fragment key={`tabbed-panel-${idx}`}>
      {/* Displays Table Row for larger screens */}
      <Hidden lgDown={isCreate} mdDown={!isCreate}>
        <StyledDisabledTableRow
          onClick={() =>
            !isSamePlan && !disabled && !isDisabledClass
              ? onSelect(type.id)
              : undefined
          }
          aria-disabled={isSamePlan || planTooSmall || isDisabledClass}
          aria-label={rowAriaLabel}
          data-qa-plan-row={type.formattedLabel}
          disabled={isSamePlan || planTooSmall || isDisabledClass}
          key={type.id}
        >
          <StyledRadioCell>
            {!isSamePlan && (
              <FormControlLabel
                control={
                  <Radio
                    checked={
                      !disabled &&
                      !planTooSmall &&
                      type.id === String(selectedID)
                    }
                    disabled={planTooSmall || disabled || isDisabledClass}
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
            {type.heading}{' '}
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
          <TableCell data-qa-monthly> ${type.price?.monthly}</TableCell>
          <TableCell data-qa-hourly>
            {isGPU ? (
              <Currency quantity={type.price.hourly ?? 0} />
            ) : (
              `$${type.price?.hourly}`
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
          checked={type.id === String(selectedID)}
          disabled={planTooSmall || isSamePlan || disabled || isDisabledClass}
          heading={type.heading}
          key={type.id}
          onClick={() => onSelect(type.id)}
          subheadings={type.subHeadings}
          tooltip={tooltip}
        />
      </Hidden>
    </React.Fragment>
  );
};
