import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { DisplayPrice } from 'src/components/DisplayPrice';
import { Typography } from 'src/components/Typography';

import {
  StyledButton,
  StyledCheckoutSection,
  StyledRoot,
  SxTypography,
} from './styles';

interface CheckoutBarProps {
  agreement?: JSX.Element;
  calculatedPrice?: number;
  children?: JSX.Element;
  disabled?: boolean;
  footer?: JSX.Element;
  heading: string;
  isMakingRequest?: boolean;
  onDeploy: () => void;
  priceHelperText?: string;
  priceSelectionText?: string;
  submitText?: string;
}

const CheckoutBar = (props: CheckoutBarProps) => {
  const {
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
          {price ? (
            <DisplayPrice interval="mo" price={price} />
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
      <StyledCheckoutSection>
        <StyledButton
          buttonType="primary"
          data-qa-deploy-linode
          disabled={disabled}
          loading={isMakingRequest}
          onClick={onDeploy}
        >
          {submitText ?? 'Create'}
        </StyledButton>
      </StyledCheckoutSection>
      {footer ? footer : null}
    </StyledRoot>
  );
};

export { CheckoutBar };
