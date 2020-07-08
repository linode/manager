import * as React from 'react';
import Tooltip, { TooltipProps } from 'src/components/core/Tooltip';
import IconTextLink from 'src/components/IconTextLink/IconTextLink_CMR';

export interface Props extends Omit<TooltipProps, 'children' | 'title'> {
  className?: any;
  display?: string;
  disabled?: boolean;
  disabledReason?: string;
  label: string;
  left?: boolean;
  onClick: (e?: React.MouseEvent<HTMLElement>) => void;
}

type CombinedProps = Props;

const AddNewLink: React.FC<CombinedProps> = props => {
  const {
    className,
    disabled,
    disabledReason,
    display,
    label,
    left,
    onClick,
    ...remainingPropsAsTooltipProps
  } = props;

  const baseProps = {
    className,
    disabled,
    left,
    onClick,
    text: label,
    title: label
  };

  if (!!disabled && !!disabledReason) {
    return (
      <Tooltip
        {...remainingPropsAsTooltipProps}
        data-qa-disabled-text-icon-tooltip
        enterTouchDelay={0}
        leaveTouchDelay={5000}
        placement={props.placement ? props.placement : 'bottom'}
        title={disabledReason}
      >
        <div>
          {/* Wrapping in div because the child of tooltip needs to be able to hold a ref */}
          <IconTextLink {...baseProps}>{display || label}</IconTextLink>
        </div>
      </Tooltip>
    );
  }

  return <IconTextLink {...baseProps}>{display || label}</IconTextLink>;
};

export default AddNewLink;
