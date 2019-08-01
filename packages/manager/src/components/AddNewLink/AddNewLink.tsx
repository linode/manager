import * as React from 'react';

import PlusSquare from 'src/assets/icons/plus-square.svg';
import Tooltip, { TooltipProps } from 'src/components/core/Tooltip';
import IconTextLink from 'src/components/IconTextLink';

export interface Props extends Omit<TooltipProps, 'children' | 'title'> {
  label: string;
  onClick: (e?: React.MouseEvent<HTMLElement>) => void;
  display?: string;
  disabled?: boolean;
  disabledReason?: string;
  left?: boolean;
  className?: any;
}

type CombinedProps = Props;

const AddNewLink: React.StatelessComponent<CombinedProps> = props => {
  const {
    onClick,
    label,
    display,
    disabled,
    left,
    className,
    disabledReason,
    children,
    ...remaningPropsAsTooltipProps
  } = props;

  if (!!disabled && !!disabledReason) {
    return (
      <Tooltip
        {...remaningPropsAsTooltipProps}
        data-qa-disabled-text-icon-tooltip
        enterTouchDelay={0}
        leaveTouchDelay={5000}
        placement={props.placement ? props.placement : 'bottom'}
        title={disabledReason}
      >
        <div>
          {/* 
            wrapping in div because the child of tooltip needs to be able to hold a ref 
          */}
          <IconTextLink
            SideIcon={PlusSquare}
            onClick={onClick}
            title={label}
            text={label}
            disabled={disabled}
            left={left}
            className={className}
          >
            {display || label}
          </IconTextLink>
        </div>
      </Tooltip>
    );
  }

  return (
    <IconTextLink
      SideIcon={PlusSquare}
      onClick={onClick}
      title={label}
      text={label}
      disabled={disabled}
      left={left}
      className={className}
    >
      {display || label}
    </IconTextLink>
  );
};

export default AddNewLink;
