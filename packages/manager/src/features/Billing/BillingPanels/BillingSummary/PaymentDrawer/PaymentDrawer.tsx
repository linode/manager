import { PaymentMethod } from '@linode/api-v4';
import { makePayment } from '@linode/api-v4/lib/account';
import { APIWarning } from '@linode/api-v4/lib/types';
import Grid from '@mui/material/Unstable_Grid2';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { useQueryClient } from 'react-query';
import { makeStyles } from 'tss-react/mui';

import { Button } from 'src/components/Button/Button';
import { Currency } from 'src/components/Currency';
import { Divider } from 'src/components/Divider';
import { Drawer } from 'src/components/Drawer';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { InputAdornment } from 'src/components/InputAdornment';
import { LinearProgress } from 'src/components/LinearProgress';
import { Notice } from 'src/components/Notice/Notice';
import { Stack } from 'src/components/Stack';
import { SupportLink } from 'src/components/SupportLink';
import { TextField } from 'src/components/TextField';
import { TooltipIcon } from 'src/components/TooltipIcon';
import { Typography } from 'src/components/Typography';
import { useAccount } from 'src/queries/account';
import { queryKey } from 'src/queries/accountBilling';
import isCreditCardExpired from 'src/utilities/creditCard';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import { PayPalErrorBoundary } from '../../PaymentInfoPanel/PayPalErrorBoundary';
import GooglePayButton from './GooglePayButton';
import PayPalButton from './PayPalButton';
import CreditCardDialog from './PaymentBits/CreditCardDialog';
import { PaymentMethodCard } from './PaymentMethodCard';
import { SetSuccess } from './types';

const useStyles = makeStyles()(() => ({
  button: {
    alignSelf: 'flex-end',
    marginLeft: 'auto',
  },
  credit: {
    color: '#02b159',
  },
  currentBalance: {
    fontSize: '1.1rem',
  },
  header: {
    fontSize: '1.1rem',
  },
  input: {
    display: 'flex',
  },
  progress: {
    height: 5,
    marginBottom: 18,
    width: '100%',
  },
}));

interface Props {
  onClose: () => void;
  open: boolean;
  paymentMethods: PaymentMethod[] | undefined;
  selectedPaymentMethod?: PaymentMethod;
}

export const getMinimumPayment = (balance: false | number) => {
  if (!balance || balance <= 0) {
    return '5.00';
  }
  /**
   * We follow the API's validation logic:
   *
   * If balance > 5 then min payment is $5
   * If balance < 5 but > 0, min payment is their balance
   * If balance < 0 then min payment is $5
   */
  return Math.min(5, balance).toFixed(2);
};

export const PaymentDrawer = (props: Props) => {
  const { onClose, open, paymentMethods, selectedPaymentMethod } = props;

  const {
    data: account,
    isLoading: accountLoading,
    refetch: accountRefetch,
  } = useAccount();

  const { classes, cx } = useStyles();
  const { enqueueSnackbar } = useSnackbar();

  const queryClient = useQueryClient();

  const hasPaymentMethods = paymentMethods && paymentMethods.length > 0;

  const [usd, setUSD] = React.useState<string>(
    getMinimumPayment(account?.balance || 0)
  );
  const [paymentMethodId, setPaymentMethodId] = React.useState<number>(-1);
  const [selectedCardExpired, setSelectedCardExpired] = React.useState<boolean>(
    false
  );
  const [dialogOpen, setDialogOpen] = React.useState<boolean>(false);
  const [submitting, setSubmitting] = React.useState<boolean>(false);

  const [warning, setWarning] = React.useState<APIWarning | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<null | string>(null);

  const [isProcessing, setIsProcessing] = React.useState<boolean>(false);

  const minimumPayment = getMinimumPayment(account?.balance || 0);
  const paymentTooLow = +usd < +minimumPayment;

  React.useEffect(() => {
    setUSD(getMinimumPayment(account?.balance || 0));
  }, [account]);

  React.useEffect(() => {
    if (open) {
      setWarning(null);
      setErrorMessage(null);
      setIsProcessing(false);
    }
  }, [open, paymentMethods]);

  React.useEffect(() => {
    if (selectedPaymentMethod) {
      setPaymentMethodId(selectedPaymentMethod.id);
      if (selectedPaymentMethod.type !== 'paypal') {
        setSelectedCardExpired(
          Boolean(
            selectedPaymentMethod.data.expiry &&
              isCreditCardExpired(selectedPaymentMethod.data.expiry)
          )
        );
      }
    }
  }, [selectedPaymentMethod]);

  const handleUSDChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUSD(e.target.value || '');
  };

  const handleOnBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const formattedUSD = Number(e.target.value).toFixed(2) || '';
    setUSD(formattedUSD);
  };

  const handlePaymentMethodChange = (id: number, cardExpired: boolean) => {
    setPaymentMethodId(id);
    setSelectedCardExpired(cardExpired);
  };

  const handleClose = () => {
    setDialogOpen(false);
  };

  const handleOpenDialog = () => {
    setDialogOpen(true);
    setErrorMessage(null);
  };

  const confirmCardPayment = () => {
    setSubmitting(true);
    setSuccess(null);
    setErrorMessage(null);

    const makePaymentData = {
      payment_method_id: paymentMethodId,
      usd: (+usd).toFixed(2),
    };

    makePayment(makePaymentData)
      .then((response) => {
        setSubmitting(false);
        setDialogOpen(false);
        setSuccess(
          `Payment for $${usd} successfully submitted`,
          true,
          response.warnings
        );
        queryClient.invalidateQueries(`${queryKey}-payments`);
      })
      .catch((errorResponse) => {
        setSubmitting(false);
        setErrorMessage(
          getAPIErrorOrDefault(
            errorResponse,
            'Unable to make a payment at this time.'
          )[0].reason
        );
      });
  };

  const setSuccess: SetSuccess = (
    message,
    paymentWasMade = false,
    warnings = undefined
  ) => {
    if (paymentWasMade && !warnings) {
      enqueueSnackbar(message, {
        variant: 'success',
      });
      // Reset everything
      setUSD('0.00');
      accountRefetch();
      onClose();
    }
    if (warnings && warnings.length > 0) {
      setWarning(warnings[0]);
    }
  };

  const renderError = (errorMsg: string) => {
    return <Notice text={errorMsg} variant="error" />;
  };

  if (!accountLoading && account?.balance === undefined) {
    return (
      <Grid container>
        <ErrorState errorText="You are not authorized to view billing information" />
      </Grid>
    );
  }

  return (
    <Drawer onClose={onClose} open={open} title="Make a Payment">
      <Stack spacing={2}>
        {errorMessage && <Notice text={errorMessage ?? ''} variant="error" />}
        {warning ? <Warning warning={warning} /> : null}
        {isProcessing ? <LinearProgress className={classes.progress} /> : null}
        {accountLoading ? (
          <Typography data-testid="loading-account">Loading</Typography>
        ) : account ? (
          <Typography className={classes.currentBalance} variant="h3">
            <strong>
              Current balance:{' '}
              <span
                className={cx({
                  [classes.credit]: account?.balance < 0,
                })}
              >
                <Currency quantity={Math.abs(account?.balance || 0)} />
                {account?.balance < 0 ? ' Credit' : ''}
              </span>
            </strong>
          </Typography>
        ) : null}
        <TextField
          InputProps={{
            startAdornment: <InputAdornment position="end">$</InputAdornment>,
          }}
          disabled={isProcessing}
          label="Payment Amount"
          noMarginTop
          onBlur={handleOnBlur}
          onChange={handleUSDChange}
          placeholder={`${minimumPayment} minimum`}
          sx={{ maxWidth: 175 }}
          type="number"
          value={usd}
        />
        <Divider spacingBottom={16} spacingTop={32} />
        <Typography className={classes.header} variant="h3">
          <strong>Payment Methods:</strong>
        </Typography>
        <Stack spacing={1}>
          {hasPaymentMethods ? (
            paymentMethods?.map((paymentMethod: PaymentMethod) => (
              <PaymentMethodCard
                handlePaymentMethodChange={handlePaymentMethodChange}
                key={paymentMethod.id}
                paymentMethod={paymentMethod}
                paymentMethodId={paymentMethodId}
              />
            ))
          ) : (
            <Typography>No payment methods on file.</Typography>
          )}
        </Stack>
        {hasPaymentMethods ? (
          <Grid className={classes.input}>
            <Grid className={classes.button}>
              {paymentTooLow || selectedCardExpired ? (
                <TooltipIcon
                  text={
                    paymentTooLow
                      ? `Payment amount must be at least ${minimumPayment}.`
                      : selectedCardExpired
                      ? 'The selected card has expired.'
                      : ''
                  }
                  status="help"
                  sxTooltipIcon={{ padding: `0px 8px` }}
                />
              ) : null}
              <Button
                buttonType="primary"
                disabled={paymentTooLow || selectedCardExpired || isProcessing}
                onClick={handleOpenDialog}
              >
                Pay Now
              </Button>
            </Grid>
          </Grid>
        ) : null}
        <Divider spacingBottom={16} spacingTop={28} />
        <Grid>
          <Typography className={classes.header} variant="h3">
            <strong>Or pay via:</strong>
          </Typography>
        </Grid>
        <Grid container spacing={2}>
          <Grid sm={6} xs={9}>
            <PayPalErrorBoundary renderError={renderError}>
              <PayPalButton
                disabled={isProcessing}
                renderError={renderError}
                setError={setErrorMessage}
                setProcessing={setIsProcessing}
                setSuccess={setSuccess}
                usd={usd}
              />
            </PayPalErrorBoundary>
          </Grid>
          <Grid sm={6} xs={9}>
            <GooglePayButton
              transactionInfo={{
                countryCode: 'US',
                currencyCode: 'USD',
                totalPrice: usd,
                totalPriceStatus: 'FINAL',
              }}
              disabled={isProcessing}
              renderError={renderError}
              setError={setErrorMessage}
              setProcessing={setIsProcessing}
              setSuccess={setSuccess}
            />
          </Grid>
        </Grid>
      </Stack>
      <CreditCardDialog
        cancel={handleClose}
        error={errorMessage}
        executePayment={confirmCardPayment}
        isMakingPayment={submitting}
        open={dialogOpen}
        usd={usd}
      />
    </Drawer>
  );
};

interface WarningProps {
  warning: APIWarning;
}

const Warning = (props: WarningProps) => {
  const { warning } = props;
  /** The most common API warning includes "please open a Support ticket",
   * which we'd like to be a link.
   */
  const ticketLink = warning.detail?.match(/open a support ticket\./i) ? (
    <>
      {warning.detail.replace(/open a support ticket\./i, '')}
      <SupportLink
        text="open a Support ticket"
        title={`Re: ${warning.detail}`}
      />
      .
    </>
  ) : (
    warning.detail ?? ''
  );
  const message = (
    <>
      {warning.title} {ticketLink}
    </>
  );
  return <Notice variant="warning">{message}</Notice>;
};

export default PaymentDrawer;
