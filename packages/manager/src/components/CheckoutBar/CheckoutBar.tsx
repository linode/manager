import { useTheme } from '@mui/material/styles';
import * as React from 'react';
import Typography from 'src/components/core/Typography';
import { DisplayPrice } from 'src/components/DisplayPrice';
import { StyledButton, StyledDiv1, StyledDiv2, SxTypography } from './styles';

interface Props {
  onDeploy: () => void;
  heading: string;
  calculatedPrice?: number;
  disabled?: boolean;
  isMakingRequest?: boolean;
  priceHelperText?: string;
  submitText?: string;
  children?: JSX.Element;
  footer?: JSX.Element;
  agreement?: JSX.Element;
}

const CheckoutBar = (props: Props) => {
  const {
    onDeploy,
    heading,
    calculatedPrice,
    disabled,
    isMakingRequest,
    priceHelperText,
    submitText,
    footer,
    agreement,
    children,
  } = props;

  const theme = useTheme();

  const price = calculatedPrice ?? 0;

  return (
    <StyledDiv1>
      <Typography
        variant="h2"
        sx={{
          color: theme.color.headline,
          fontSize: '1.125rem',
          wordBreak: 'break-word',
        }}
        data-qa-order-summary
      >
        {heading}
      </Typography>
      {children}
      {
        <StyledDiv2 data-qa-total-price>
          <DisplayPrice price={price} interval="mo" />
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
        </StyledDiv2>
      }
      {agreement ? agreement : null}
      <StyledDiv2>
        <StyledButton
          buttonType="primary"
          disabled={disabled}
          onClick={onDeploy}
          data-qa-deploy-linode
          loading={isMakingRequest}
        >
          {submitText ?? 'Create'}
        </StyledButton>
      </StyledDiv2>
      {footer ? footer : null}
    </StyledDiv1>
  );
};

export { CheckoutBar };
