import { PaymentMethod } from '@linode/api-v4';
import { makePayment } from '@linode/api-v4/lib/account';
import { APIWarning } from '@linode/api-v4/lib/types';
import classNames from 'classnames';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import Button from 'src/components/Button';
import Divider from 'src/components/core/Divider';
import InputAdornment from 'src/components/core/InputAdornment';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Currency from 'src/components/Currency';
import Drawer from 'src/components/Drawer';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import HelpIcon from 'src/components/HelpIcon';
import LinearProgress from 'src/components/LinearProgress';
import Notice from 'src/components/Notice';
import SupportLink from 'src/components/SupportLink';
import TextField from 'src/components/TextField';
import PayPalErrorBoundary from 'src/features/Billing/BillingPanels/PaymentInfoPanel/PayPalErrorBoundary';
import { useAccount } from 'src/queries/account';
import { queryKey } from 'src/queries/accountBilling';
import { queryClient } from 'src/queries/base';
import isCreditCardExpired from 'src/utilities/creditCard';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import GooglePayButton from './GooglePayButton';
import CreditCardDialog from './PaymentBits/CreditCardDialog';
import { PaymentMethodCard } from './PaymentMethodCard';
import PayPalButton from './PayPalButton';
import { SetSuccess } from './types';

const useStyles = makeStyles((theme: Theme) => ({
  currentBalance: {
    fontSize: '1.1rem',
    marginBottom: theme.spacing(4),
  },
  credit: {
    color: '#02b159',
  },
  header: {
    fontSize: '1.1rem',
    marginBottom: theme.spacing(4),
  },
  progress: {
    marginBottom: 18,
    width: '100%',
    height: 5,
  },
  input: {
    display: 'flex',
  },
  button: {
    alignSelf: 'flex-end',
    marginLeft: 'auto',
  },
  helpIcon: {
    padding: `0px 8px`,
  },
}));

interface Props {
  open: boolean;
  paymentMethods: PaymentMethod[] | undefined;
  selectedPaymentMethod?: PaymentMethod;
  onClose: () => void;
}

export const getMinimumPayment = (balance: number | false) => {
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

export const PaymentDrawer: React.FC<Props> = (props) => {
  const { paymentMethods, selectedPaymentMethod, open, onClose } = props;

  const {
    data: account,
    isLoading: accountLoading,
    refetch: accountRefetch,
  } = useAccount();

  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();

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
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

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
      usd: (+usd).toFixed(2),
      payment_method_id: paymentMethodId,
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
    return <Notice error text={errorMsg} />;
  };

  if (!accountLoading && account?.balance === undefined) {
    return (
      <Grid container>
        <ErrorState errorText="You are not authorized to view billing information" />
      </Grid>
    );
  }

  return (
    <Drawer title="Make a Payment" open={open} onClose={onClose}>
      <Grid container>
        <Grid item xs={12}>
          {errorMessage && <Notice error text={errorMessage ?? ''} />}
          {warning ? <Warning warning={warning} /> : null}
          {isProcessing ? (
            <LinearProgress className={classes.progress} />
          ) : null}
          {accountLoading ? (
            <Typography data-testid="loading-account">Loading</Typography>
          ) : account ? (
            <Grid item>
              <Typography variant="h3" className={classes.currentBalance}>
                <strong>
                  Current balance:{' '}
                  <span
                    className={classNames({
                      [classes.credit]: account?.balance < 0,
                    })}
                  >
                    <Currency quantity={Math.abs(account?.balance || 0)} />
                    {account?.balance < 0 ? ' Credit' : ''}
                  </span>
                </strong>
              </Typography>
            </Grid>
          ) : null}
          <Grid item xs={6}>
            <TextField
              label="Payment Amount"
              onChange={handleUSDChange}
              onBlur={handleOnBlur}
              value={usd}
              type="number"
              placeholder={`${minimumPayment} minimum`}
              disabled={isProcessing}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="end">$</InputAdornment>
                ),
              }}
            />
          </Grid>
          <Divider spacingTop={32} spacingBottom={16} />
          <Grid container direction="column">
            <Grid item>
              <Typography
                variant="h3"
                className={classes.header}
                style={{ marginBottom: 8 }}
              >
                <strong>Payment Methods:</strong>
              </Typography>
            </Grid>
            <Grid item>
              {hasPaymentMethods ? (
                paymentMethods?.map((paymentMethod: PaymentMethod) => (
                  <PaymentMethodCard
                    key={paymentMethod.id}
                    paymentMethod={paymentMethod}
                    paymentMethodId={paymentMethodId}
                    handlePaymentMethodChange={handlePaymentMethodChange}
                  />
                ))
              ) : (
                <Grid item>
                  <Typography>No payment methods on file.</Typography>
                </Grid>
              )}
            </Grid>
            {hasPaymentMethods ? (
              <Grid item className={classes.input}>
                <Grid className={classes.button}>
                  {paymentTooLow || selectedCardExpired ? (
                    <HelpIcon
                      className={classes.helpIcon}
                      text={
                        paymentTooLow
                          ? `Payment amount must be at least ${minimumPayment}.`
                          : selectedCardExpired
                          ? 'The selected card has expired.'
                          : ''
                      }
                    />
                  ) : null}
                  <Button
                    buttonType="primary"
                    onClick={handleOpenDialog}
                    disabled={
                      paymentTooLow || selectedCardExpired || isProcessing
                    }
                  >
                    Pay Now
                  </Button>
                </Grid>
              </Grid>
            ) : null}
          </Grid>
          <CreditCardDialog
            error={errorMessage}
            isMakingPayment={submitting}
            cancel={handleClose}
            executePayment={confirmCardPayment}
            open={dialogOpen}
            usd={usd}
          />
          <Divider spacingTop={28} spacingBottom={16} />
          <Grid item>
            <Typography variant="h3" className={classes.header}>
              <strong>Or pay via:</strong>
            </Typography>
          </Grid>
          <Grid container>
            <Grid item xs={9} sm={6}>
              <PayPalErrorBoundary renderError={renderError}>
                <PayPalButton
                  usd={usd}
                  disabled={isProcessing}
                  setSuccess={setSuccess}
                  setError={setErrorMessage}
                  setProcessing={setIsProcessing}
                  renderError={renderError}
                />
              </PayPalErrorBoundary>
            </Grid>
            <Grid item xs={9} sm={6}>
              <GooglePayButton
                transactionInfo={{
                  totalPriceStatus: 'FINAL',
                  currencyCode: 'USD',
                  countryCode: 'US',
                  totalPrice: usd,
                }}
                balance={account?.balance ?? false}
                disabled={isProcessing}
                setSuccess={setSuccess}
                setError={setErrorMessage}
                setProcessing={setIsProcessing}
                renderError={renderError}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Drawer>
  );
};

interface WarningProps {
  warning: APIWarning;
}

const Warning: React.FC<WarningProps> = (props) => {
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
  return <Notice warning>{message}</Notice>;
};

export default PaymentDrawer;
