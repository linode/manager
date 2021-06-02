import * as React from 'react';
import { makePayment } from '@linode/api-v4/lib/account';
import Button from 'src/components/Button';
import { Theme, makeStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import TextField from 'src/components/TextField';
import { cleanCVV } from 'src/features/Billing/billingUtils';
import CreditCard from 'src/features/Billing/BillingPanels/PaymentInfoPanel/CreditCard';
import CreditCardDialog from './PaymentBits/CreditCardDialog';
import isCreditCardExpired from 'src/utilities/isCreditCardExpired';
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
    marginLeft: -theme.spacing(),
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
      <Grid container direction="column" className={classes.root}>
        <Grid item>
          <Typography variant="h3" className={classes.header}>
            <strong>Pay via credit card</strong>
          </Typography>
        </Grid>
        <Grid item className={classes.cardSection}>
          {hasCreditCardOnFile ? (
            <CreditCard
              provider={'Mastercard'}
              expiry={expiry}
              lastFour={lastFour}
            />
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
              disabled={!hasCreditCardOnFile || paymentTooLow || isCardExpired}
              tooltipText={
                paymentTooLow
                  ? `Payment amount must be at least ${minimumPayment}.`
                  : undefined
              }
            >
              Pay with Credit Card
            </Button>
          </Grid>
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

export default React.memo(CreditCardPayment);
