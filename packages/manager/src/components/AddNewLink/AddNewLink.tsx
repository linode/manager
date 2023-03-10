import * as React from 'react';
import Tooltip, { TooltipProps } from 'src/components/core/Tooltip';
import Button from '../Button';

export interface Props extends Omit<TooltipProps, 'children' | 'title'> {
  display?: string;
  disabled?: boolean;
  disabledReason?: string;
  label: string;
  onClick: (e?: React.MouseEvent<HTMLElement>) => void;
}

const AddNewLink = (props: Props) => {
  const {
    disabled,
    disabledReason,
    display,
    label,
    onClick,
    className,
    ...remainingPropsAsTooltipProps
  } = props;

  const baseProps = {
    disabled,
    onClick,
    text: label,
    title: label,
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
          {/* Wrapping in div because the child of tooltip needs to be able to hold a ref */}
          <Button buttonType="primary" {...baseProps}>
            {display || label}
          </Button>
        </div>
      </Tooltip>
    );
  }

  return (
    <Button buttonType="primary" {...baseProps}>
      {display || label}
    </Button>
  );
};

export default AddNewLink;
