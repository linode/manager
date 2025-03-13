import { Box, Divider, Notice, TooltipIcon, Typography } from '@linode/ui';
import Grid from '@mui/material/Grid2';
import * as React from 'react';

import { Drawer } from 'src/components/Drawer';
import { LinearProgress } from 'src/components/LinearProgress';
import { MAXIMUM_PAYMENT_METHODS } from 'src/constants';
import { getRestrictedResourceText } from 'src/features/Account/utils';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';
import { useProfile } from '@linode/queries';

import GooglePayChip from '../GooglePayChip';
import { PayPalChip } from '../PayPalChip';
import { PayPalErrorBoundary } from '../PayPalErrorBoundary';
import AddCreditCardForm from './AddCreditCardForm';

import type { PaymentMethod } from '@linode/api-v4/lib/account';
import type { NoticeVariant } from '@linode/ui';
import type { VariantType } from 'notistack';

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
  const { data: profile } = useProfile();
  const [isProcessing, setIsProcessing] = React.useState<boolean>(false);
  const [noticeMessage, setNoticeMessage] = React.useState<
    PaymentMessage | undefined
  >(undefined);
  const isChildUser = profile?.user_type === 'child';
  const isReadOnly =
    useRestrictedGlobalGrantCheck({
      globalGrantType: 'account_access',
      permittedGrantLevel: 'read_write',
    }) || isChildUser;

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

  const disabled = isProcessing || hasMaxPaymentMethods || isReadOnly;

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
      {isReadOnly && (
        <Grid size={12}>
          <Notice
            text={getRestrictedResourceText({
              isChildUser,
              resourceType: 'Account',
            })}
            variant="error"
          />
        </Grid>
      )}
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
            <Grid
              size={{
                md: 9,
                xs: 8,
              }}
            >
              <Typography variant="h3">Google Pay</Typography>
              <Typography>
                You&rsquo;ll be taken to Google Pay to complete sign up.
              </Typography>
            </Grid>
            {!isReadOnly && (
              <Grid
                container
                size={{
                  md: 3,
                  xs: 4,
                }}
                sx={{
                  alignContent: 'center',
                  justifyContent: 'flex-end',
                }}
              >
                <GooglePayChip
                  disabled={disabled}
                  onClose={onClose}
                  renderError={renderError}
                  setMessage={setMessage}
                  setProcessing={setIsProcessing}
                />
              </Grid>
            )}
          </Grid>
        </Box>
        <Divider />
        <Box sx={sxBox}>
          <Grid container spacing={2}>
            <Grid
              size={{
                md: 9,
                xs: 8,
              }}
            >
              <Typography variant="h3">PayPal</Typography>
              <Typography>
                You&rsquo;ll be taken to PayPal to complete sign up.
              </Typography>
            </Grid>
            {!isReadOnly && (
              <Grid
                container
                size={{
                  md: 3,
                  xs: 4,
                }}
                sx={{
                  alignContent: 'center',
                  justifyContent: 'flex-end',
                }}
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
            )}
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
