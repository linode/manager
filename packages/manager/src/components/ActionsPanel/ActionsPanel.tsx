import { SxProps, styled } from '@mui/material/styles';
import cx from 'classnames';
import * as React from 'react';

import { Button } from 'src/components/Button/Button';
import RenderGuard from 'src/components/RenderGuard';

import { Box, BoxProps } from '../Box';

interface ActionPanelProps extends BoxProps {
  /**
   * primary type actionable button custom aria descripton.
   */
  primaryButtonAriaDescribedBy?: string;

  /**
   * The data-testid for secondary type actionable button.
   */
  primaryButtonDataTestId?: string;

  /**
   * If true disables primary type actionable button.
   * @default false
   */
  primaryButtonDisabled?: boolean;

  /**
   * Callback for primary type actionable button to be executed when it is clicked.
   */
  primaryButtonHandler?: () => void;

  /**
   * primary button loading state.
   */
  primaryButtonLoading?: boolean;

  /**
   * primary button role
   */
  primaryButtonRole?: string;

  /**
   * The primaryButton sx props.
   */
  primaryButtonSx?: SxProps;

  /**
   * The text for primary type actionable button.
   */
  primaryButtonText?: string;

  /**
   * The text for primary type actionable button tooltip.
   */
  primaryButtonToolTip?: string;

  /**
   * The primaryButtonType defines type of button.
   */
  primaryButtonType?: 'button' | 'reset' | 'submit' | undefined;

  /**
   * The eliminates left and right padding.
   * @default false
   */
  secondaryButtonCompactX?: boolean;

  /**
   * The eliminates top and bottom padding.
   * @default false
   */
  secondaryButtonCompactY?: boolean;

  /**
   * The data-testid for secondary type actionable button.
   */
  secondaryButtonDataTestId?: string;

  /**
   * If true disables secondary type actionable button.
   * @default false
   */
  secondaryButtonDisabled?: boolean;

  /**
   * Callback for secondary type actionable button to be executed when it is clicked.
   */
  secondaryButtonHandler?: (e?: React.MouseEvent<HTMLElement>) => void;

  /**
   * The secondary button sx props.
   */
  secondaryButtonSx?: SxProps;

  /**
   * The text for secondary type actionable button.
   */
  secondaryButtonText?: string;

  /**
   * The text for secondary type actionable button tooltip.
   */
  secondaryButtonToolTip?: string;

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
    primaryButtonAriaDescribedBy,
    primaryButtonDataTestId,
    primaryButtonDisabled,
    primaryButtonHandler,
    primaryButtonLoading,
    primaryButtonRole,
    primaryButtonSx,
    primaryButtonText,
    primaryButtonToolTip,
    primaryButtonType,
    secondaryButtonCompactX,
    secondaryButtonCompactY,
    secondaryButtonDataTestId,
    secondaryButtonDisabled,
    secondaryButtonHandler,
    secondaryButtonSx,
    secondaryButtonText,
    showPrimary,
    showSecondary,
    ...rest
  } = props;

  const primaryButtonDataQAProp = `data-qa-${primaryButtonDataTestId}`;
  const secondaryButtonDataQAProp = `data-qa-${secondaryButtonDataTestId}`;

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
          compactX={secondaryButtonCompactX}
          compactY={secondaryButtonCompactY}
          data-qa-cancel
          data-testid={secondaryButtonDataTestId}
          disabled={secondaryButtonDisabled}
          onClick={secondaryButtonHandler}
          sx={secondaryButtonSx}
        >
          {secondaryButtonText}
        </Button>
      ) : null}
      {showPrimary ? (
        <Button
          {...{ [primaryButtonDataQAProp]: true }}
          aria-describedby={primaryButtonAriaDescribedBy}
          buttonType="primary"
          data-testid={primaryButtonDataTestId}
          disabled={primaryButtonDisabled}
          loading={primaryButtonLoading}
          onClick={primaryButtonHandler}
          role={primaryButtonRole}
          sx={primaryButtonSx}
          tooltipText={primaryButtonToolTip}
          type={primaryButtonType}
        >
          {primaryButtonText}
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
