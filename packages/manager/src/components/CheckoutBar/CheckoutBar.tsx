import { Box, Button, Paper, Stack, Typography } from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';
import type { JSX } from 'react';

import { DisplayPrice } from 'src/components/DisplayPrice';

import { SxTypography } from './styles';

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
  children?: React.ReactNode;
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

export const CheckoutBar = (props: CheckoutBarProps) => {
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
    <Paper sx={{ position: 'sticky', top: 0 }}>
      <Stack spacing={2}>
        <Typography
          data-qa-order-summary
          sx={{
            color: theme.color.headline,
            fontSize: '1.125rem',
            wordBreak: 'break-word',
          }}
          variant="h2"
        >
          {heading}
        </Typography>
        {(price >= 0 && !disabled) || price ? (
          <>
            {children}
            <Box>
              <DisplayPrice data-qa-total-price interval="mo" price={price} />
            </Box>
            {additionalPricing}
          </>
        ) : (
          <Typography py={1}>{priceSelectionText}</Typography>
        )}
        {priceHelperText && price > 0 && (
          <Typography sx={SxTypography}>{priceHelperText}</Typography>
        )}
        {agreement ? agreement : null}
        <Button
          buttonType="primary"
          data-qa-deploy-linode
          disabled={disabled}
          loading={isMakingRequest}
          onClick={onDeploy}
          sx={(theme) => ({
            mt: `${theme.spacingFunction(24)} !important`,
            [theme.breakpoints.down('lg')]: {
              alignSelf: 'flex-end',
            },
          })}
        >
          {submitText ?? 'Create'}
        </Button>
        {footer ? footer : null}
      </Stack>
    </Paper>
  );
};
