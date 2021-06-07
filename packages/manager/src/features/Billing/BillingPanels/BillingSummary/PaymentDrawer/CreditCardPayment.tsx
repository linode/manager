import * as React from 'react';
import * as classnames from 'classnames';
import { makePayment } from '@linode/api-v4/lib/account';
import Button from 'src/components/Button';
import { Theme, makeStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import TextField from 'src/components/TextField';
import { cleanCVV } from 'src/features/Billing/billingUtils';
import CreditCardDialog from './PaymentBits/CreditCardDialog';
import isCreditCardExpired from 'src/utilities/isCreditCardExpired';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { SetSuccess } from './types';
import CreditCard from './CreditCard';
import useFlags from 'src/hooks/useFlags';

// @TODO: remove unused code and feature flag logic once google pay is released
const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: theme.spacing(4),
  },
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
  lastFour: string;
  expiry: string;
  usd: string;
  minimumPayment: string;
  setSuccess: SetSuccess;
}

export const CreditCardPayment: React.FC<Props> = (props) => {
  const { expiry, lastFour, minimumPayment, setSuccess, usd } = props;
  const [cvv, setCVV] = React.useState<string>('');
  const [dialogOpen, setDialogOpen] = React.useState<boolean>(false);
  const [submitting, setSubmitting] = React.useState<boolean>(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const classes = useStyles();
  const flags = useFlags();
  const isCardExpired = (expiry && isCreditCardExpired(expiry)) || false;

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
          `Payment for $${usd} submitted successfully`,
          true,
          response.warnings
        );
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

  const hasCreditCardOnFile = Boolean(lastFour);
  const paymentTooLow = +usd < +minimumPayment;

  return (
    <>
      <Grid
        container
        direction="column"
        className={classnames({
          [classes.root]: !flags.additionalPaymentMethods?.includes(
            'google_pay'
          ),
        })}
      >
        <Grid item>
          <Typography variant="h3" className={classes.header}>
            <strong>Pay via credit card</strong>
          </Typography>
        </Grid>
        {flags.additionalPaymentMethods?.includes('google_pay') ? (
          <>
            <Grid item className={classes.cardSectionNew}>
              {hasCreditCardOnFile ? (
                <CreditCard type={'Visa'} expiry={expiry} lastFour={lastFour} />
              ) : (
                <Typography>No credit card on file.</Typography>
              )}
            </Grid>
            <Grid item className={classes.input}>
              <Grid item>
                {hasCreditCardOnFile ? (
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
                ) : null}
              </Grid>
              <Grid item className={classes.button}>
                <Button
                  buttonType="primary"
                  onClick={handleOpenDialog}
                  disabled={
                    !hasCreditCardOnFile || paymentTooLow || isCardExpired
                  }
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
          </>
        ) : hasCreditCardOnFile ? (
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
                disabled={!hasCreditCardOnFile || paymentTooLow}
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
          <Typography>No credit card on file.</Typography>
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
