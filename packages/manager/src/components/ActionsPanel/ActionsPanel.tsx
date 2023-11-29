import { styled } from '@mui/material/styles';
import cx from 'classnames';
import * as React from 'react';

import { Button, ButtonProps } from 'src/components/Button/Button';
import { RenderGuard } from 'src/components/RenderGuard';

import { Box, BoxProps } from '../Box';

interface ActionButtonsProps extends ButtonProps {
  'data-node-idx'?: number;
  'data-testid'?: string;
  'data-qa-form-data-loading'?: boolean;
  label: string;
}

interface ActionPanelProps extends BoxProps {
  /**
   * primary type actionable button custom aria descripton.
   */
  primaryButtonProps?: ActionButtonsProps;

  /**
   * secondary type actionable button custom aria descripton.
   */
  secondaryButtonProps?: ActionButtonsProps;
}

const ActionsPanelComponent = (props: ActionPanelProps) => {
  const {
    className,
    primaryButtonProps,
    secondaryButtonProps,

    ...rest
  } = props;

  const primaryButtonDataQAProp = `data-qa-${primaryButtonProps?.['data-testid']}`;
  const secondaryButtonDataQAProp = `data-qa-${secondaryButtonProps?.['data-testid']}`;

  return (
    <StyledBox
      className={cx(className, 'actionPanel')}
      data-qa-buttons
      {...rest}
    >
      {secondaryButtonProps ? (
        <Button
          {...{ [secondaryButtonDataQAProp]: true }}
          buttonType="secondary"
          data-qa-cancel
          {...secondaryButtonProps}
        >
          {secondaryButtonProps.label}
        </Button>
      ) : null}
      {primaryButtonProps ? (
        <Button
          {...{ [primaryButtonDataQAProp]: true }}
          buttonType="primary"
          {...primaryButtonProps}
        >
          {primaryButtonProps.label}
        </Button>
      ) : null}
    </StyledBox>
  );
};

const StyledBox = styled(Box)(({ theme: { spacing } }) => ({
  '& > :first-of-type': {
    marginLeft: 0,
    marginRight: spacing(),
  },
  '& > :only-child': {
    marginRight: 0,
  },
  '& > button': {
    marginBottom: spacing(1),
  },
  justifyContent: 'flex-end',
  marginTop: spacing(1),
  paddingBottom: spacing(1),
  paddingTop: spacing(1),
}));

const ActionsPanel = RenderGuard(ActionsPanelComponent);

export { ActionsPanel };
