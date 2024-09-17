import * as React from 'react';

import { Tooltip } from 'src/components/Tooltip';

import { Button } from '../Button/Button';

import type { TooltipProps } from 'src/components/Tooltip';

interface Props extends Omit<TooltipProps, 'children' | 'title'> {
  disabled?: boolean;
  disabledReason?: string;
  display?: string;
  label: string;
  onClick: (e?: React.MouseEvent<HTMLElement>) => void;
}

export const AddNewLink = (props: Props) => {
  const {
    className,
    disabled,
    disabledReason,
    display,
    label,
    onClick,
    ...remainingPropsAsTooltipProps
  } = props;

  const baseProps = {
    className,
    disabled,
    onClick,
    text: label,
    title: label,
  };

  if (!!disabled && !!disabledReason) {
    return (
      <Tooltip
        {...remainingPropsAsTooltipProps}
        data-testid="disabled-tooltip"
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
