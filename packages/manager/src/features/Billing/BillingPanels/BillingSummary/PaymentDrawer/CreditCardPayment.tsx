import * as React from 'react';
import { makePayment, CardType } from '@linode/api-v4/lib/account';
import isCreditCardExpired from 'src/utilities/isCreditCardExpired';
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
  type?: CardType | null;
  lastFour: string;
  expiry: string;
  usd: string;
  minimumPayment: string;
  setSuccess: SetSuccess;
}

export const CreditCardPayment: React.FC<Props> = (props) => {
  const { type, expiry, lastFour, minimumPayment, usd, setSuccess } = props;
  const [cvv, setCVV] = React.useState<string>('');
  const [dialogOpen, setDialogOpen] = React.useState<boolean>(false);
  const [submitting, setSubmitting] = React.useState<boolean>(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const classes = useStyles();
  const flags = useFlags();

  const showGooglePay = flags.additionalPaymentMethods?.includes('google_pay');
  const isCardExpired = (expiry && isCreditCardExpired(expiry)) || false;
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
              <CreditCard type={type} expiry={expiry} lastFour={lastFour} />
            </Grid>
            {lastFour ? (
              <Grid item className={classes.input}>
                <Grid item>
                  <TextField
                    label="CVV (optional):"
                    onChange={handleCVVChange}
                    value={cvv}
                    type="text"
                    inputProps={{ id: 'paymentCVV' }}
                    className={classes.cvvField}
                    hasAbsoluteError
                    noMarginTop
                  />
                </Grid>
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
                    Pay via Credit Card
                  </Button>
                </Grid>
              </Grid>
            ) : null}
          </>
        ) : lastFour ? (
          <>
            <Grid item>
              <Grid container direction="row" wrap="nowrap" alignItems="center">
                <Grid item className={classes.cardSection}>
                  <Typography className={classes.cardText}>
                    Card ending in {lastFour}
                  </Typography>
                  {Boolean(expiry) && (
                    <Typography className={classes.cardText}>
                      Expires {expiry}
                    </Typography>
                  )}
                </Grid>
                <Grid item className={classes.cvvFieldWrapper}>
                  <TextField
                    label="CVV (optional):"
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
                disabled={!lastFour || paymentTooLow}
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
        ) : (
          <Grid item>
            <Typography>No credit card on file.</Typography>
          </Grid>
        )}
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
