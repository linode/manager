import * as React from 'react';

import Button from 'src/components/Button';
import { Theme, makeStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import TextField from 'src/components/TextField';

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
  errorText?: string;
  submitForm: (cvv: string) => void;
}

export const CreditCard: React.FC<Props> = props => {
  const { errorText, expiry, lastFour, submitForm } = props;
  const [cvv, setCVV] = React.useState<string>('');
  const classes = useStyles();

  return (
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
          <Button buttonType="primary" onClick={() => submitForm(cvv)}>
            Pay now
          </Button>
        </Grid>
        <Grid item>
          <TextField
            errorText={errorText}
            label="Please enter your CVV:"
            onChange={(e: any) => setCVV(e.target.value)}
            value={cvv}
            type="text"
            placeholder={'000'}
            inputProps={{ id: 'paymentCVV' }}
            className={classes.cvvField}
          />
        </Grid>
      </Grid>
    </Grid>
  );
};

export default React.memo(CreditCard);
