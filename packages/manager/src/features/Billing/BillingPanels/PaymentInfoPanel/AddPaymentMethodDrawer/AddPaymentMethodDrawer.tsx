import { PaymentMethod } from '@linode/api-v4/lib/account';
import { Box } from 'src/components/Box';
import Grid from '@mui/material/Unstable_Grid2';
import { VariantType } from 'notistack';
import * as React from 'react';

import { Divider } from 'src/components/Divider';
import { Drawer } from 'src/components/Drawer';
import { LinearProgress } from 'src/components/LinearProgress';
import { Notice, NoticeVariant } from 'src/components/Notice/Notice';
import { TooltipIcon } from 'src/components/TooltipIcon';
import { Typography } from 'src/components/Typography';
import { MAXIMUM_PAYMENT_METHODS } from 'src/constants';

import GooglePayChip from '../GooglePayChip';
import { PayPalChip } from '../PayPalChip';
import { PayPalErrorBoundary } from '../PayPalErrorBoundary';
import AddCreditCardForm from './AddCreditCardForm';

interface Props {
  onClose: () => void;
  open: boolean;
  paymentMethods: PaymentMethod[] | undefined;
}

export interface PaymentMessage {
  text: string;
  variant: VariantType;
}

const sxBox = {
  paddingBottom: '8px',
  paddingTop: '8px',
};

const sxTooltipIcon = {
  '& svg': {
    height: '28px',
    width: '28px',
  },
  '&:hover': {
    opacity: 0.7,
  },
};

export const AddPaymentMethodDrawer = (props: Props) => {
  const { onClose, open, paymentMethods } = props;
  const [isProcessing, setIsProcessing] = React.useState<boolean>(false);
  const [noticeMessage, setNoticeMessage] = React.useState<
    PaymentMessage | undefined
  >(undefined);

  React.useEffect(() => {
    if (open) {
      setIsProcessing(false);
      setNoticeMessage(undefined);
    }
  }, [open]);

  const setMessage = (message: PaymentMessage) => {
    setNoticeMessage(message);
  };

  const renderError = (errorMsg: string) => {
    return (
      <TooltipIcon
        status="error"
        sxTooltipIcon={sxTooltipIcon}
        text={errorMsg}
      />
    );
  };

  const hasMaxPaymentMethods = paymentMethods
    ? paymentMethods.length >= MAXIMUM_PAYMENT_METHODS
    : false;

  const disabled = isProcessing || hasMaxPaymentMethods;

  return (
    <Drawer onClose={onClose} open={open} title="Add Payment Method">
      {isProcessing ? (
        <LinearProgress
          sx={{
            height: 5,
            marginBottom: 2,
            width: '100%',
          }}
        />
      ) : null}
      {hasMaxPaymentMethods ? (
        <Notice
          text="You reached the maximum number of payment methods on your account. Delete an existing payment method to add a new one."
          variant="warning"
        />
      ) : null}
      {noticeMessage ? (
        <Notice
          text={noticeMessage.text}
          variant={noticeMessage.variant as NoticeVariant}
        />
      ) : null}
      <>
        <Divider />
        <Box sx={sxBox}>
          <Grid container spacing={2}>
            <Grid md={9} xs={8}>
              <Typography variant="h3">Google Pay</Typography>
              <Typography>
                You&rsquo;ll be taken to Google Pay to complete sign up.
              </Typography>
            </Grid>
            <Grid
              alignContent="center"
              container
              justifyContent="flex-end"
              md={3}
              xs={4}
            >
              <GooglePayChip
                disabled={disabled}
                onClose={onClose}
                renderError={renderError}
                setMessage={setMessage}
                setProcessing={setIsProcessing}
              />
            </Grid>
          </Grid>
        </Box>
        <Divider />
        <Box sx={sxBox}>
          <Grid container spacing={2}>
            <Grid md={9} xs={8}>
              <Typography variant="h3">PayPal</Typography>
              <Typography>
                You&rsquo;ll be taken to PayPal to complete sign up.
              </Typography>
            </Grid>
            <Grid
              alignContent="center"
              container
              justifyContent="flex-end"
              md={3}
              xs={4}
            >
              <PayPalErrorBoundary renderError={renderError}>
                <PayPalChip
                  disabled={disabled}
                  onClose={onClose}
                  renderError={renderError}
                  setMessage={setMessage}
                  setProcessing={setIsProcessing}
                />
              </PayPalErrorBoundary>
            </Grid>
          </Grid>
        </Box>
        <Divider spacingBottom={16} />
        <Typography variant="h3">Credit Card</Typography>
        <AddCreditCardForm disabled={disabled} onClose={onClose} />
      </>
    </Drawer>
  );
};

export default AddPaymentMethodDrawer;
