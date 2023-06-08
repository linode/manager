import * as React from 'react';
import { useSelector } from 'react-redux';
import classNames from 'classnames';
import { BaseType, LinodeTypeClass } from '@linode/api-v4/lib/linodes';
import Chip from 'src/components/core/Chip';
import FormControlLabel from 'src/components/core/FormControlLabel';
import Hidden from 'src/components/core/Hidden';
import { Currency } from 'src/components/Currency';
import { TooltipIcon } from 'src/components/TooltipIcon/TooltipIcon';
import { Radio } from 'src/components/Radio/Radio';
import SelectionCard from 'src/components/SelectionCard';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { ApplicationState } from 'src/store';
import { LINODE_NETWORK_IN } from 'src/constants';
import { convertMegabytesTo } from 'src/utilities/unitConversions';
import { ExtendedType } from 'src/utilities/extendType';
import { useSelectPlanPanelStyles } from './styles/plansPanelStyles';

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

  const { classes } = useSelectPlanPanelStyles();

  const selectedLinodePlanType = useSelector((state: ApplicationState) => {
    if (linodeID) {
      return state?.__resources.linodes.itemsById[linodeID]?.type;
    }
    return linodeID;
  });

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
        <TableRow
          data-qa-plan-row={type.formattedLabel}
          aria-label={rowAriaLabel}
          key={type.id}
          onClick={() =>
            !isSamePlan && !isDisabledClass ? onSelect(type.id) : undefined
          }
          aria-disabled={isSamePlan || planTooSmall || isDisabledClass}
          className={classNames(classes.focusedRow, {
            [classes.disabledRow]:
              isSamePlan || planTooSmall || isDisabledClass,
          })}
        >
          <TableCell className={classes.radioCell}>
            {!isSamePlan && (
              <FormControlLabel
                label={type.heading}
                aria-label={type.heading}
                className={'label-visually-hidden'}
                control={
                  <Radio
                    checked={!planTooSmall && type.id === String(selectedID)}
                    onChange={() => onSelect(type.id)}
                    disabled={planTooSmall || disabled || isDisabledClass}
                    id={type.id}
                  />
                }
              />
            )}
          </TableCell>
          <TableCell data-qa-plan-name>
            <div className={classes.headingCellContainer}>
              {type.heading}{' '}
              {(isSamePlan || type.id === selectedLinodePlanType) && (
                <Chip
                  data-qa-current-plan
                  label="Current Plan"
                  aria-label="This is your current plan"
                  className={classes.chip}
                />
              )}
              {tooltip && (
                <TooltipIcon
                  text={tooltip}
                  tooltipPosition="right-end"
                  sxTooltipIcon={{
                    paddingTop: '0px !important',
                    paddingBottom: '0px !important',
                  }}
                  status="help"
                />
              )}
            </div>
          </TableCell>
          <TableCell data-qa-monthly> ${type.price?.monthly}</TableCell>
          <TableCell data-qa-hourly>
            {isGPU ? (
              <Currency quantity={type.price.hourly ?? 0} />
            ) : (
              `$${type.price?.hourly}`
            )}
          </TableCell>
          <TableCell center noWrap data-qa-ram>
            {convertMegabytesTo(type.memory, true)}
          </TableCell>
          <TableCell center data-qa-cpu>
            {type.vcpus}
          </TableCell>
          <TableCell center noWrap data-qa-storage>
            {convertMegabytesTo(type.disk, true)}
          </TableCell>
          {shouldShowTransfer && type.transfer ? (
            <TableCell center data-qa-transfer>
              {type.transfer / 1000} TB
            </TableCell>
          ) : null}
          {shouldShowNetwork && type.network_out ? (
            <TableCell center noWrap data-qa-network>
              {LINODE_NETWORK_IN} Gbps{' '}
              <span style={{ color: '#9DA4A6' }}>/</span>{' '}
              {type.network_out / 1000} Gbps
            </TableCell>
          ) : null}
        </TableRow>
      </Hidden>

      {/* Displays SelectionCard for small screens */}
      <Hidden lgUp={isCreate} mdUp={!isCreate}>
        <SelectionCard
          key={type.id}
          checked={type.id === String(selectedID)}
          onClick={() => onSelect(type.id)}
          heading={type.heading}
          subheadings={type.subHeadings}
          disabled={planTooSmall || isSamePlan || disabled || isDisabledClass}
          tooltip={tooltip}
        />
      </Hidden>
    </React.Fragment>
  );
};
