import { Typography } from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { DisplayPrice } from 'src/components/DisplayPrice';

import {
  StyledButton,
  StyledCheckoutSection,
  StyledRoot,
  SxTypography,
} from './styles';

export interface CheckoutBarProps {
  /**
   * Additional pricing to display after the calculated total
   */
  additionalPricing?: JSX.Element;
  /**
   * JSX element to be displayed as an agreement section.
   */
  agreement?: JSX.Element;
  /**
   * Calculated price to be displayed.
   */
  calculatedPrice?: number;
  /**
   * JSX element for additional content to be rendered within the component.
   */
  children?: JSX.Element;
  /**
   * Boolean to disable the `CheckoutBar` component, making it non-interactive.
   * @default false
   */
  disabled?: boolean;
  /**
   * JSX element to be displayed as a footer.
   */
  footer?: JSX.Element;
  /**
   * The heading text to be displayed in the `CheckoutBar`.
   */
  heading: string;
  /**
   * Boolean indicating if a request is currently being processed.
   */
  isMakingRequest?: boolean;
  /**
   * Callback function to be called when the deploy action is triggered.
   */
  onDeploy: () => void;
  /**
   * Helper text to be displayed alongside the price.
   */
  priceHelperText?: string;
  /**
   * Text to describe the price selection.
   */
  priceSelectionText?: string;
  /**
   * Text for the submit button.
   */
  submitText?: string;
}

const CheckoutBar = (props: CheckoutBarProps) => {
  const {
    additionalPricing,
    agreement,
    calculatedPrice,
    children,
    disabled,
    footer,
    heading,
    isMakingRequest,
    onDeploy,
    priceHelperText,
    priceSelectionText,
    submitText,
  } = props;

  const theme = useTheme();

  const price = calculatedPrice ?? 0;

  return (
    <StyledRoot>
      <Typography
        sx={{
          color: theme.color.headline,
          fontSize: '1.125rem',
          wordBreak: 'break-word',
        }}
        data-qa-order-summary
        variant="h2"
      >
        {heading}
      </Typography>
      {children}
      {
        <StyledCheckoutSection data-qa-total-price>
          {(price >= 0 && !disabled) || price ? (
            <>
              <DisplayPrice interval="mo" price={price} />
              {additionalPricing}
            </>
          ) : (
            <Typography>{priceSelectionText}</Typography>
          )}
          {priceHelperText && price > 0 && (
            <Typography
              sx={{
                ...SxTypography,
                marginTop: theme.spacing(),
              }}
            >
              {priceHelperText}
            </Typography>
          )}
        </StyledCheckoutSection>
      }
      {agreement ? agreement : null}
      <StyledButton
        buttonType="primary"
        data-qa-deploy-linode
        disabled={disabled}
        loading={isMakingRequest}
        onClick={onDeploy}
      >
        {submitText ?? 'Create'}
      </StyledButton>
      {footer ? footer : null}
    </StyledRoot>
  );
};

export { CheckoutBar };
