import * as React from 'react';
import { makePayment } from '@linode/api-v4/lib/account';
import Button from 'src/components/Button';
import { Theme, makeStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import TextField from 'src/components/TextField';
import { cleanCVV } from 'src/features/Billing/billingUtils';
import CreditCardDialog from './PaymentBits/CreditCardDialog';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { SetSuccess } from './types';

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
  cardText: {
    padding: '1px',
    lineHeight: '1.5rem',
  },
  cvvFieldWrapper: {
    '& label': {
      fontSize: 12,
    },
  },
}));

export interface Props {
  lastFour: string;
  expiry: string;
  usd: string;
  minimumPayment: string;
  setSuccess: SetSuccess;
}

export const CreditCard: React.FC<Props> = props => {
  const { expiry, lastFour, minimumPayment, setSuccess, usd } = props;
  const [cvv, setCVV] = React.useState<string>('');
  const [dialogOpen, setDialogOpen] = React.useState<boolean>(false);
  const [submitting, setSubmitting] = React.useState<boolean>(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const classes = useStyles();

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
      .then(response => {
        setSubmitting(false);
        setDialogOpen(false);
        setSuccess(
          `Payment for $${usd} submitted successfully`,
          true,
          response.warnings
        );
      })
      .catch(errorResponse => {
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
      <Grid container direction="column" className={classes.root}>
        <Grid item>
          <Typography variant="h3" className={classes.header}>
            <strong>Pay via credit card</strong>
          </Typography>
        </Grid>
        <Grid item>
          {hasCreditCardOnFile ? (
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
          ) : (
            <Typography>No credit card on file.</Typography>
          )}
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

export default React.memo(CreditCard);
