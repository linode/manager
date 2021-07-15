import * as React from 'react';
import {
  makePayment,
  CreditCard as CreditCardType,
} from '@linode/api-v4/lib/account';
import isCreditCardExpired, { formatExpiry } from 'src/utilities/creditCard';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { cleanCVV } from 'src/features/Billing/billingUtils';
import Button from 'src/components/Button';
import { makeStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import TextField from 'src/components/TextField';
import CreditCardDialog from './PaymentBits/CreditCardDialog';
import { SetSuccess } from './types';
import CreditCard from './CreditCard';
import useFlags from 'src/hooks/useFlags';
import { queryClient } from 'src/queries/base';
import { queryKey } from 'src/queries/accountBilling';

// @TODO: remove unused code and feature flag logic once google pay is released
const useStyles = makeStyles(() => ({
  header: {
    fontSize: '1.1rem',
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
  input: {
    display: 'flex',
  },
  button: {
    alignSelf: 'flex-end',
    marginLeft: 'auto',
  },
}));

export interface Props {
  creditCard: CreditCardType;
  usd: string;
  minimumPayment: string;
  setSuccess: SetSuccess;
  disabled: boolean;
}

export const CreditCardPayment: React.FC<Props> = (props) => {
  const { creditCard, minimumPayment, usd, setSuccess, disabled } = props;
  const [cvv, setCVV] = React.useState<string>('');
  const [dialogOpen, setDialogOpen] = React.useState<boolean>(false);
  const [submitting, setSubmitting] = React.useState<boolean>(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const classes = useStyles();
  const flags = useFlags();

  const showGooglePay = flags.additionalPaymentMethods?.includes('google_pay');
  const isCardExpired =
    (creditCard.expiry && isCreditCardExpired(creditCard.expiry)) || false;
  const paymentTooLow = +usd < +minimumPayment;

  const handleCVVChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const _cvv = cleanCVV(e.target.value);
    setCVV(_cvv);
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

    makePayment({
      usd: (+usd).toFixed(2),
      cvv,
    })
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

  return (
    <>
      <Grid container direction="column">
        <Grid item>
          <Typography variant="h3" className={classes.header}>
            <strong>Pay via credit card</strong>
          </Typography>
        </Grid>
        {showGooglePay ? (
          <>
            <Grid item className={classes.cardSectionNew}>
              <CreditCard creditCard={creditCard} />
            </Grid>
            {creditCard.last_four ? (
              <Grid item className={classes.input}>
                <Grid item>
                  <TextField
                    label="Security Code (optional)"
                    onChange={handleCVVChange}
                    value={cvv}
                    type="text"
                    inputProps={{ id: 'paymentCVV' }}
                    className={classes.cvvField}
                    hasAbsoluteError
                    noMarginTop
                    disabled={disabled}
                  />
                </Grid>
                <Grid item className={classes.button}>
                  <Button
                    buttonType="primary"
                    onClick={handleOpenDialog}
                    disabled={paymentTooLow || isCardExpired || disabled}
                    tooltipText={
                      paymentTooLow
                        ? `Payment amount must be at least ${minimumPayment}.`
                        : undefined
                    }
                  >
                    Pay via Credit Card
                  </Button>
                </Grid>
              </Grid>
            ) : null}
          </>
        ) : creditCard.last_four ? (
          <>
            <Grid item>
              <Grid container direction="row" wrap="nowrap" alignItems="center">
                <Grid item className={classes.cardSection}>
                  <Typography className={classes.cardText}>
                    Card ending in {creditCard.last_four}
                  </Typography>
                  {Boolean(creditCard.expiry) && (
                    <Typography className={classes.cardText}>
                      Expires {formatExpiry(creditCard.expiry ?? '')}
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
            <Grid item>
              <Button
                buttonType="primary"
                onClick={handleOpenDialog}
                disabled={!creditCard.last_four || paymentTooLow}
                tooltipText={
                  paymentTooLow
                    ? `Payment amount must be at least ${minimumPayment}.`
                    : undefined
                }
              >
                Pay Now
              </Button>
            </Grid>
          </>
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
    </>
  );
};

export default React.memo(CreditCardPayment);
