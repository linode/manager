import * as React from 'react';
import { makeStyles } from 'src/components/core/styles';
import Tooltip, { TooltipProps } from 'src/components/core/Tooltip';
import Button from '../Button';

export interface Props extends Omit<TooltipProps, 'children' | 'title'> {
  display?: string;
  disabled?: boolean;
  disabledReason?: string;
  label: string;
  left?: boolean;
  onClick: (e?: React.MouseEvent<HTMLElement>) => void;
}

type CombinedProps = Props;

const useStyles = makeStyles(() => ({
  root: {
    minHeight: 30,
  },
}));

const AddNewLink: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  const {
    disabled,
    disabledReason,
    display,
    label,
    left,
    onClick,
    ...remainingPropsAsTooltipProps
  } = props;

  const baseProps = {
    disabled,
    left,
    onClick,
    text: label,
    title: label,
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
          <Button buttonType="primary" className={classes.root} {...baseProps}>
            {display || label}
          </Button>
        </div>
      </Tooltip>
    );
  }

  return (
    <Button buttonType="primary" className={classes.root} {...baseProps}>
      {display || label}
    </Button>
  );
};

export default AddNewLink;
