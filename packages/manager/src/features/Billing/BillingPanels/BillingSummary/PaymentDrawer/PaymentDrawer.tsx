import { PaymentMethod } from '@linode/api-v4';
import { makePayment } from '@linode/api-v4/lib/account';
import { APIWarning } from '@linode/api-v4/lib/types';
import * as classnames from 'classnames';
import * as React from 'react';
import makeAsyncScriptLoader from 'react-async-script';
import { v4 } from 'uuid';
import { useSnackbar } from 'notistack';
import { cleanCVV } from 'src/features/Billing/billingUtils';
import { getIcon as getCreditCardIcon } from 'src/features/Billing/BillingPanels/BillingSummary/PaymentDrawer/CreditCard';
import Divider from 'src/components/core/Divider';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Button from 'src/components/Button';
import Chip from 'src/components/core/Chip';
import Currency from 'src/components/Currency';
import Drawer from 'src/components/Drawer';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import {
  thirdPartyPaymentMap,
  getIcon as getTPPIcon,
} from 'src/components/PaymentMethodRow/ThirdPartyPayment';
import SelectionCard from 'src/components/SelectionCard';
import SupportLink from 'src/components/SupportLink';
import TextField from 'src/components/TextField';
import LinearProgress from 'src/components/LinearProgress';
import useFlags from 'src/hooks/useFlags';
import { useAccount } from 'src/queries/account';
import { queryKey } from 'src/queries/accountBilling';
import { queryClient } from 'src/queries/base';
import isCreditCardExpired, { formatExpiry } from 'src/utilities/creditCard';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { SetSuccess } from './types';
import GooglePayButton from './GooglePayButton';
import CreditCardDialog from './PaymentBits/CreditCardDialog';
import PayPal, { paypalScriptSrc } from './Paypal';

// @TODO: remove unused code and feature flag logic once google pay is released
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
    marginTop: theme.spacing(2),
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
    display: 'contents',
    marginBottom: theme.spacing(),
    '& .innerGrid': {
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
  chip: {
    '& span': {
      color: 'inherit !important',
      fontSize: '0.625rem',
    },
  },
}));

interface Props {
  open: boolean;
  paymentMethods: PaymentMethod[] | undefined;
  selectedPaymentMethodId?: number;
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
  const { paymentMethods, selectedPaymentMethodId, open, onClose } = props;

  const {
    data: account,
    isLoading: accountLoading,
    refetch: accountRefetch,
  } = useAccount();

  const classes = useStyles();
  const flags = useFlags();
  const { enqueueSnackbar } = useSnackbar();

  const showGooglePay = flags.additionalPaymentMethods?.includes('google_pay');

  const creditCard = paymentMethods?.filter(
    (paymentMethod) => paymentMethod.type === 'credit_card'
  )[0];

  const [usd, setUSD] = React.useState<string>(
    getMinimumPayment(account?.balance || 0)
  );

  const isCardExpired = Boolean(
    creditCard?.data.expiry && isCreditCardExpired(creditCard?.data.expiry)
  );

  const [cvv, setCVV] = React.useState<string>('');
  const [paymentMethodId, setPaymentMethodId] = React.useState<number>(-1);
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
    if (selectedPaymentMethodId) {
      setPaymentMethodId(selectedPaymentMethodId);
    }
  }, [selectedPaymentMethodId]);

  const handleUSDChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUSD(e.target.value || '');
  };

  const handleOnBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const formattedUSD = Number(e.target.value).toFixed(2) || '';
    setUSD(formattedUSD);
  };

  const handleCVVChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const _cvv = cleanCVV(e.target.value);
    setCVV(_cvv);
  };

  const handlePaymentMethodChange = (id: number) => {
    setPaymentMethodId(id);
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

    const makePaymentData = showGooglePay
      ? {
          usd: (+usd).toFixed(2),
          payment_method_id: paymentMethodId,
        }
      : {
          usd: (+usd).toFixed(2),
          cvv,
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

  if (!accountLoading && account?.balance === undefined) {
    return (
      <Grid container>
        <ErrorState errorText="You are not authorized to view billing information" />
      </Grid>
    );
  }

  const onScriptLoad = () => {
    setIsPaypalScriptLoaded(true);
  };

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
                    className={classnames({
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
            />
          </Grid>
          <Divider spacingTop={32} spacingBottom={16} />
          {showGooglePay ? (
            <Grid container direction="column">
              <Grid item>
                <Typography
                  variant="h3"
                  className={classes.header}
                  style={{ marginBottom: 16 }}
                >
                  <strong>Payment Methods:</strong>
                </Typography>
              </Grid>
              {paymentMethods && paymentMethods?.length > 0 ? (
                paymentMethods?.map((paymentMethod: PaymentMethod) => {
                  const heading = `${
                    paymentMethod.type !== 'credit_card'
                      ? thirdPartyPaymentMap[paymentMethod.type].label
                      : ''
                  } ${paymentMethod.data.card_type} ****${
                    paymentMethod.data.last_four
                  }`;

                  const renderIcon = () => {
                    const Icon =
                      paymentMethod.type !== 'credit_card'
                        ? getTPPIcon(paymentMethod.type)
                        : getCreditCardIcon(paymentMethod.data.card_type);
                    return <Icon />;
                  };

                  const renderVariant = () => {
                    return paymentMethod.is_default ? (
                      <Grid item className={`${classes.chip}`} xs={3} md={2}>
                        <Chip label="DEFAULT" component="span" />
                      </Grid>
                    ) : null;
                  };

                  return (
                    <Grid
                      key={paymentMethod.id}
                      className={classes.paymentMethod}
                    >
                      <SelectionCard
                        className={classes.selectionCard}
                        checked={paymentMethod.id === paymentMethodId}
                        onClick={() =>
                          handlePaymentMethodChange(paymentMethod.id)
                        }
                        renderIcon={renderIcon}
                        renderVariant={renderVariant}
                        heading={heading}
                        subheadings={[
                          `Expires ${formatExpiry(
                            paymentMethod.data.expiry ?? ''
                          )}`,
                        ]}
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
          ) : creditCard ? (
            <Grid item>
              <Grid container direction="row" wrap="nowrap" alignItems="center">
                <Grid item className={classes.cardSection}>
                  <Typography className={classes.cardText}>
                    Card ending in {creditCard.data.last_four}
                  </Typography>
                  {Boolean(creditCard.data.expiry) && (
                    <Typography className={classes.cardText}>
                      Expires {formatExpiry(creditCard.data.expiry ?? '')}
                    </Typography>
                  )}
                </Grid>
                <Grid item className={classes.cvvFieldWrapper}>
                  <TextField
                    label="CVV (optional)"
                    small
                    onChange={handleCVVChange}
                    value={cvv}
                    type="text"
                    inputProps={{ id: 'paymentCVV' }}
                    className={classes.cvvField}
                    hasAbsoluteError
                    noMarginTop
                  />
                </Grid>
              </Grid>
            </Grid>
          ) : (
            <Grid item>
              <Typography>No credit card on file.</Typography>
            </Grid>
          )}
          <Grid item className={classes.input}>
            <Grid item className={classes.button}>
              <Button
                buttonType="primary"
                onClick={handleOpenDialog}
                disabled={paymentTooLow || isCardExpired}
                tooltipText={
                  paymentTooLow
                    ? `Payment amount must be at least ${minimumPayment}.`
                    : undefined
                }
              >
                Pay Now
              </Button>
            </Grid>
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
          {showGooglePay ? (
            <>
              <Grid item>
                <Typography variant="h3" className={classes.header}>
                  <strong>Or pay via:</strong>
                </Typography>
              </Grid>
              <Grid container>
                <Grid item>
                  <AsyncPaypal
                    key={payPalKey}
                    usd={usd}
                    setSuccess={setSuccess}
                    asyncScriptOnLoad={onScriptLoad}
                    isScriptLoaded={isPaypalScriptLoaded}
                    disabled={isProcessing}
                  />
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
                  />
                </Grid>
              </Grid>
            </>
          ) : (
            <AsyncPaypal
              key={payPalKey}
              usd={usd}
              setSuccess={setSuccess}
              asyncScriptOnLoad={onScriptLoad}
              isScriptLoaded={isPaypalScriptLoaded}
            />
          )}
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
