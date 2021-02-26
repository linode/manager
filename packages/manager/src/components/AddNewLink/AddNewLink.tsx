import * as React from 'react';
import Tooltip, { TooltipProps } from 'src/components/core/Tooltip';
import Button from '../Button';

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

const AddNewLink: React.FC<CombinedProps> = props => {
  const {
    onClick,
    label,
    display,
    disabled,
    left,
    className,
    disabledReason,
    children,
    ...remainingPropsAsTooltipProps
  } = props;

  const baseProps = {
    onClick,
    title: label,
    text: label,
    disabled,
    left,
    className,
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
          {/*
            wrapping in div because the child of tooltip needs to be able to hold a ref 
          */}
          <Button buttonType="secondary" {...baseProps}>
            {display || label}
          </Button>
        </div>
      </Tooltip>
    );
  }

  return <Button {...baseProps}>{display || label}</Button>;
};

export default AddNewLink;
