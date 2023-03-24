import React from 'react';
import { useSelector } from 'react-redux';
import { LinodeTypeClass } from '@linode/api-v4/lib/linodes';
import classNames from 'classnames';
import { LINODE_NETWORK_IN } from 'src/constants';
import Chip from 'src/components/core/Chip';
import Currency from 'src/components/Currency';
import FormControlLabel from 'src/components/core/FormControlLabel';
import HelpIcon from 'src/components/HelpIcon';
import Hidden from 'src/components/core/Hidden';
import Radio from 'src/components/Radio';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import SelectionCard from 'src/components/SelectionCard';
import { ApplicationState } from 'src/store';
import { convertMegabytesTo } from 'src/utilities/unitConversions';
import { PlanSelectionType } from './SelectPlanPanel';
import { useSelectPlanPanelStyles } from './SelectPlanPanelStyles';

interface Props {
  header?: string;
  isCreate?: boolean;
  type: PlanSelectionType;
  idx: number;
  selectedDiskSize?: number;
  currentPlanHeading?: string;
  showTransfer?: boolean;
  disabledClasses?: LinodeTypeClass[];
  disabled?: boolean;
  onSelect: (key: string) => void;
  selectedID?: string;
  linodeID?: number | undefined;
}

const RenderSelection = ({
  type,
  idx,
  isCreate,
  selectedDiskSize,
  currentPlanHeading,
  showTransfer,
  disabledClasses,
  disabled,
  selectedID,
  linodeID,
  onSelect,
}: Props) => {
  const classes = useSelectPlanPanelStyles();

  const getDisabledClass = (thisClass: string) => {
    const upDatedDisabledClasses = (disabledClasses as string[]) ?? []; // Not a big fan of the casting here but it works
    return upDatedDisabledClasses.includes(thisClass);
  };

  const selectedLinodePlanType = useSelector((state: ApplicationState) => {
    if (linodeID) {
      return state?.__resources.linodes.itemsById[linodeID]?.type;
    }
    return linodeID;
  });

  const diskSize = selectedDiskSize ? selectedDiskSize : 0;
  let tooltip;
  const planTooSmall = diskSize > type.disk;
  const isSamePlan = type.heading === currentPlanHeading;
  const isGPU = type.class === 'gpu';
  const isDisabledClass = getDisabledClass(type.class);
  const shouldShowTransfer = showTransfer && type.transfer;
  const shouldShowNetwork = showTransfer && type.network_out;

  if (planTooSmall) {
    tooltip = `This plan is too small for the selected image.`;
  }

  const rowAriaLabel =
    type && type.label && isSamePlan
      ? `${type.label} this is your current plan`
      : planTooSmall
      ? `${type.label} this plan is too small for resize`
      : type.label;

  return (
    <React.Fragment key={`tabbed-panel-${idx}`}>
      {/* Displays Table Row for larger screens */}
      <Hidden lgDown={isCreate} mdDown={!isCreate}>
        <TableRow
          data-qa-plan-row={type.label}
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
                <HelpIcon
                  text={tooltip}
                  tooltipPosition="right-end"
                  className="py0"
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

export default RenderSelection;
