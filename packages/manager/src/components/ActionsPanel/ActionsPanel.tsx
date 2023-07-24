import { styled } from '@mui/material/styles';
import cx from 'classnames';
import * as React from 'react';

import { Button, ButtonProps } from 'src/components/Button/Button';
import RenderGuard from 'src/components/RenderGuard';

import { Box, BoxProps } from '../Box';

interface ActionButtonsProps extends ButtonProps {
  'data-testid'?: string;
  label?: string;
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

  /**
   * Renders primary type actionable button.
   */
  showPrimary?: boolean;

  /**
   * Renders secondary type actionable button.
   */
  showSecondary?: boolean;
}

const ActionsPanel = (props: ActionPanelProps) => {
  const {
    className,
    primaryButtonProps,
    secondaryButtonProps,
    showPrimary,
    showSecondary,
    ...rest
  } = props;

  const primaryButtonDataQAProp = `data-qa-${primaryButtonProps?.['data-testId']}`;
  const secondaryButtonDataQAProp = `data-qa-${secondaryButtonProps?.['data-testId']}`;

  return (
    <StyledBox
      className={cx(className, 'actionPanel')}
      data-qa-buttons
      {...rest}
    >
      {showSecondary ? (
        <Button
          {...{ [secondaryButtonDataQAProp]: true }}
          buttonType="secondary"
          data-qa-cancel
          {...secondaryButtonProps}
        >
          {secondaryButtonProps?.label}
        </Button>
      ) : null}
      {showPrimary ? (
        <Button
          {...{ [primaryButtonDataQAProp]: true }}
          buttonType="primary"
          {...primaryButtonProps}
        >
          {primaryButtonProps?.label}
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
  display: 'flex',
  justifyContent: 'flex-end',
  marginTop: spacing(2),
  paddingBottom: spacing(1),
  paddingTop: spacing(2),
}));

export default RenderGuard(ActionsPanel);
