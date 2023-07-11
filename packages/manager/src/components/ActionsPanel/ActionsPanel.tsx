import * as React from 'react';
import { Button } from 'src/components/Button/Button';
import cx from 'classnames';
import RenderGuard from 'src/components/RenderGuard';
import { styled, SxProps } from '@mui/material/styles';
import { Box, BoxProps } from '../Box';

interface ActionPanelProps extends BoxProps {
  /**
   * Renders primary type actionable button.
   */
  showPrimary?: boolean;

  /**
   * primary type actionable button custom aria descripton.
   */
  primaryButtonAriaDescribedBy?: string;

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
   * The text for primary type actionable button.
   */
  primaryButtonText?: string;

  /**
   * The data-testid for secondary type actionable button.
   */
  primaryButtonDataTestId?: string;

  /**
   * The primaryButtonType defines type of button.
   */
  primaryButtonType?: 'button' | 'submit' | 'reset' | undefined;

  /**
   * The primaryButton sx props.
   */
  primaryButtonSx?: SxProps;

  /**
   * The text for primary type actionable button tooltip.
   */
  primaryButtonToolTip?: string;

  /**
   * Renders secondary type actionable button.
   */
  showSecondary?: boolean;

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
   * The data-testid for secondary type actionable button.
   */
  secondaryButtonDataTestId?: string;

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
   * The text for secondary type actionable button tooltip.
   */
  secondaryButtonToolTip?: string;
}

const ActionsPanel = (props: ActionPanelProps) => {
  const {
    className,
    showPrimary: primary,
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
    showSecondary: secondary,
    secondaryButtonCompactX,
    secondaryButtonCompactY,
    secondaryButtonDataTestId,
    secondaryButtonDisabled,
    secondaryButtonHandler,
    secondaryButtonSx,
    secondaryButtonText,
    ...rest
  } = props;

  const primaryButtonDataQAProp = `data-qa-${primaryButtonDataTestId}`;
  const secondaryButtonDataQAProp = `data-qa-${secondaryButtonDataTestId}`;

  return (
    <StyledBox
      data-qa-buttons
      className={cx(className, 'actionPanel')}
      {...rest}
    >
      {secondary ? (
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
      {primary ? (
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
  display: 'flex',
  justifyContent: 'flex-end',
  marginTop: spacing(2),
  paddingTop: spacing(2),
  paddingBottom: spacing(1),
  '& > button': {
    marginBottom: spacing(1),
  },
  '& > :first-of-type': {
    marginRight: spacing(),
    marginLeft: 0,
  },
  '& > :only-child': {
    marginRight: 0,
  },
}));

export default RenderGuard(ActionsPanel);
