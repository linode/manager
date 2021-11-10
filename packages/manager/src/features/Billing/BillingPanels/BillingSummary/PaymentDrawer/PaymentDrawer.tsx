import { PaymentMethod } from '@linode/api-v4';
import { makePayment } from '@linode/api-v4/lib/account';
import { APIWarning } from '@linode/api-v4/lib/types';
import classNames from 'classnames';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import makeAsyncScriptLoader from 'react-async-script';
import Button from 'src/components/Button';
import Chip from 'src/components/core/Chip';
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
import {
  getIcon as getTPPIcon,
  thirdPartyPaymentMap,
} from 'src/components/PaymentMethodRow/ThirdPartyPayment';
import SelectionCard from 'src/components/SelectionCard';
import SupportLink from 'src/components/SupportLink';
import TextField from 'src/components/TextField';
import { getIcon as getCreditCardIcon } from 'src/features/Billing/BillingPanels/BillingSummary/PaymentDrawer/CreditCard';
import PayPalErrorBoundary from 'src/features/Billing/BillingPanels/PaymentInfoPanel/PayPalErrorBoundary';
import useFlags from 'src/hooks/useFlags';
import { useAccount } from 'src/queries/account';
import { queryKey } from 'src/queries/accountBilling';
import { queryClient } from 'src/queries/base';
import isCreditCardExpired, { formatExpiry } from 'src/utilities/creditCard';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { v4 } from 'uuid';
import GooglePayButton from './GooglePayButton';
import PayPalButton from './PayPalButton';
import CreditCardDialog from './PaymentBits/CreditCardDialog';
import PayPal, { paypalScriptSrc } from './Paypal';
import { SetSuccess } from './types';

// @TODO: remove feature flag logic and old paypal code once braintree paypal is released
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
  cvvField: {
    width: 100,
  },
  cardSection: {
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    flexFlow: 'column nowrap',
  },
  cardSectionNew: {
    marginLeft: -7,
  },
  cardText: {
    padding: '1px',
    lineHeight: '1.5rem',
  },
  cvvFieldWrapper: {
    '& label': {
      fontSize: 12,
    },
  },
  paymentMethod: {
    marginBottom: theme.spacing(),
  },
  selectionCard: {
    minWidth: '100%',
    padding: 0,
    marginBottom: theme.spacing(),
    '& .cardBaseGrid': {
      flexWrap: 'nowrap',
    },
    '& .cardBaseIcon': {
      width: 45,
      padding: 0,
      justifyContent: 'center',
    },
    '& .cardBaseHeadings': {
      flex: 'inherit',
    },
  },
  expired: {
    '& .cardBaseSubHeading': {
      color: theme.color.red,
    },
  },
  chip: {
    '& span': {
      color: 'inherit !important',
      fontSize: '0.625rem',
    },
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

const AsyncPaypal = makeAsyncScriptLoader(paypalScriptSrc())(PayPal);

export const PaymentDrawer: React.FC<Props> = (props) => {
  const { paymentMethods, selectedPaymentMethod, open, onClose } = props;

  const {
    data: account,
    isLoading: accountLoading,
    refetch: accountRefetch,
  } = useAccount();

  const classes = useStyles();
  const flags = useFlags();
  const { enqueueSnackbar } = useSnackbar();

  const braintreePayPal = flags.additionalPaymentMethods?.includes('paypal');

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

  const [payPalKey, setPayPalKey] = React.useState<string>(v4());
  const [
    isPaypalScriptLoaded,
    setIsPaypalScriptLoaded,
  ] = React.useState<boolean>(false);

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
      setPayPalKey(v4());
      accountRefetch();
      onClose();
    }
    if (warnings && warnings.length > 0) {
      setWarning(warnings[0]);
    }
  };

  const onScriptLoad = () => {
    setIsPaypalScriptLoaded(true);
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
                paymentMethods?.map((paymentMethod: PaymentMethod) => {
                  const { id, type, is_default } = paymentMethod;

                  const getIsCardExpired = (paymentMethod: PaymentMethod) => {
                    if (paymentMethod.type === 'paypal') {
                      return false;
                    }

                    return Boolean(
                      paymentMethod.data.expiry &&
                        isCreditCardExpired(paymentMethod.data.expiry)
                    );
                  };

                  const getHeading = (paymentMethod: PaymentMethod) => {
                    switch (paymentMethod.type) {
                      case 'paypal':
                        return thirdPartyPaymentMap[type].label;
                      case 'google_pay':
                        return `${thirdPartyPaymentMap[type].label} ${paymentMethod.data.card_type} ****${paymentMethod.data.last_four}`;
                      default:
                        return `${paymentMethod.data.card_type} ****${paymentMethod.data.last_four}`;
                    }
                  };

                  const getSubHeading = (
                    paymentMethod: PaymentMethod,
                    isExpired: boolean
                  ) => {
                    // eslint-disable-next-line sonarjs/no-small-switch
                    switch (paymentMethod.type) {
                      case 'paypal':
                        return paymentMethod.data.email;
                      default:
                        return `${
                          isExpired ? 'Expired' : 'Expires'
                        } ${formatExpiry(paymentMethod.data.expiry ?? '')}`;
                    }
                  };

                  const getIcon = (paymentMethod: PaymentMethod) => {
                    // eslint-disable-next-line sonarjs/no-small-switch
                    switch (paymentMethod.type) {
                      case 'credit_card':
                        return getCreditCardIcon(paymentMethod.data.card_type);
                      default:
                        return getTPPIcon(paymentMethod.type);
                    }
                  };

                  const heading = getHeading(paymentMethod);

                  const cardIsExpired = getIsCardExpired(paymentMethod);

                  const subHeading = getSubHeading(
                    paymentMethod,
                    cardIsExpired
                  );

                  const renderIcon = () => {
                    const Icon = getIcon(paymentMethod);
                    return <Icon />;
                  };

                  const renderVariant = () => {
                    return is_default ? (
                      <Grid item className={classes.chip} xs={3} md={2}>
                        <Chip label="DEFAULT" component="span" />
                      </Grid>
                    ) : null;
                  };

                  return (
                    <Grid key={id} className={classes.paymentMethod}>
                      <SelectionCard
                        className={classNames({
                          [classes.selectionCard]: true,
                          [classes.expired]: cardIsExpired,
                        })}
                        checked={id === paymentMethodId}
                        onClick={() =>
                          handlePaymentMethodChange(id, cardIsExpired)
                        }
                        renderIcon={renderIcon}
                        renderVariant={renderVariant}
                        heading={heading}
                        subheadings={[subHeading]}
                      />
                    </Grid>
                  );
                })
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
              {braintreePayPal ? (
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
              ) : (
                <AsyncPaypal
                  key={payPalKey}
                  usd={usd}
                  setSuccess={setSuccess}
                  asyncScriptOnLoad={onScriptLoad}
                  isScriptLoaded={isPaypalScriptLoaded}
                  disabled={isProcessing}
                />
              )}
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
