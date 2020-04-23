import * as React from 'react';
import { makePayment } from 'linode-js-sdk/lib/account';
import Button from 'src/components/Button';
import { Theme, makeStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import TextField from 'src/components/TextField';
import CreditCardDialog from './PaymentBits/CreditCardDialog';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    paddingTop: theme.spacing(3)
  },
  header: {
    fontSize: '1.2rem'
  },
  cvvField: {
    width: 180
  }
}));

export interface Props {
  lastFour: string;
  expiry: string;
  usd: string;
  setSuccess: (message: string | null, paymentWasMade?: boolean) => void;
}

export const CreditCard: React.FC<Props> = props => {
  const { expiry, lastFour, setSuccess, usd } = props;
  const [cvv, setCVV] = React.useState<string>('');
  const [dialogOpen, setDialogOpen] = React.useState<boolean>(false);
  const [submitting, setSubmitting] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const [cvvError, setCVVError] = React.useState<string | null>(null);
  const classes = useStyles();

  const handleCVVChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCVVError(null);
    // All characters except numbers
    const regex = /(([\D]))/;

    // Prevents more than 4 characters from being submitted
    const cvv = e.target.value.slice(0, 4);
    setCVV(cvv.replace(regex, ''));
  };

  const handleClose = () => {
    setDialogOpen(false);
  };

  const handleOpen = () => {
    if (!cvv) {
      return setCVVError('CVV is required');
    }
    setDialogOpen(true);
    setError(null);
  };

  const confirmCardPayment = () => {
    setSubmitting(true);
    setSuccess(null);
    setError(null);

    makePayment({
      usd: (+usd).toFixed(2),
      cvv
    })
      .then(_ => {
        setSubmitting(false);
        setDialogOpen(false);
        setSuccess(`Payment for $${usd} submitted successfully`);
        // props.requestAccount();
      })
      .catch(errorResponse => {
        setSubmitting(false);
        setError(
          getAPIErrorOrDefault(
            errorResponse,
            'Unable to make a payment at this time.'
          )[0].reason
        );
      });
  };

  return (
    <>
      <Grid container direction="column" className={classes.root}>
        <Grid item>
          <Typography className={classes.header}>
            <strong>Pay via credit card</strong>
          </Typography>
        </Grid>
        <Grid item>
          <Typography>XXXX XXXX XXXX {lastFour}</Typography>
          <Typography>Expires {expiry}</Typography>
        </Grid>
        <Grid container alignItems="flex-end" justify="flex-start">
          <Grid item>
            <Button buttonType="primary" onClick={handleOpen}>
              Pay now
            </Button>
          </Grid>
          <Grid item>
            <TextField
              errorText={cvvError ?? ''}
              label="Please enter your CVV:"
              onChange={handleCVVChange}
              value={cvv}
              type="text"
              placeholder={'000'}
              inputProps={{ id: 'paymentCVV' }}
              className={classes.cvvField}
            />
          </Grid>
        </Grid>
      </Grid>
      <CreditCardDialog
        error={error}
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
