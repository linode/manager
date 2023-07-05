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
  primary?: boolean;

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
   * The eliminates left and right padding.
   */
  primaryButtonCompactX?: boolean;

  /**
   * The eliminates top and bottom padding.
   */
  primaryButtonCompactY?: boolean;

  /**
   * Renders secondary type actionable button.
   */
  secondary?: boolean;

  /**
   * If true disables secondary type actionable button.
   * @default false
   */
  secondaryButtonDisabled?: boolean;

  /**
   * Callback for secondary type actionable button to be executed when it is clicked.
   */
  secondaryButtonHandler?: () => void;

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
}

const ActionsPanel = (props: ActionPanelProps) => {
  const {
    children,
    className,
    primary,
    primaryButtonAriaDescribedBy,
    primaryButtonDataTestId,
    primaryButtonDisabled,
    primaryButtonHandler,
    primaryButtonRole,
    primaryButtonLoading,
    primaryButtonText,
    primaryButtonType,
    primaryButtonSx,
    secondary,
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
          type={primaryButtonType}
          sx={primaryButtonSx}
          role={primaryButtonRole}
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
