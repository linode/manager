import * as React from 'react';
import { useEffect } from 'react';
import { ScriptStatus, useLazyScript } from 'src/hooks/useScript';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import { SetSuccess } from './types';
import { makeStyles, Theme } from 'src/components/core/styles';
import GooglePayClient from 'src/features/Billing/Providers/GooglePay';
import GooglePayIcon from 'src/assets/icons/payment/googlePayButton.svg';

const useStyles = makeStyles((theme: Theme) => ({
  button: {
    border: 0,
    backgroundColor: 'transparent',
    marginTop: theme.spacing(),
    padding: 0,
  },
  svg: {
    borderRadius: 5,
  },
}));

interface Props {
  usd: string;
  setSuccess: SetSuccess;
}

const GooglePay: React.FC<Props> = (props) => {
  const { setSuccess, usd } = props;
  const classes = useStyles();
  const { status, load } = useLazyScript(
    'https://pay.google.com/gp/p/js/pay.js'
  );

  const handlePay = () => {
    const client = new GooglePayClient();

    client.init(
      process.env.REACT_APP_BT_TOKEN || '',
      {
        totalPriceStatus: 'FINAL',
        currencyCode: 'USD',
        countryCode: 'US',
        totalPrice: usd,
      },
      setSuccess
    );
  };

  useEffect(() => {
    if (status == ScriptStatus.READY) {
      handlePay();
    }
  }, [status]);

  if (status == ScriptStatus.ERROR) {
    return (
      <Grid container direction="column">
        <Notice error text="There was an error connecting with Google Pay." />
      </Grid>
    );
  }

  return (
    <button
      className={classes.button}
      onClick={status == ScriptStatus.READY ? handlePay : load}
    >
      <GooglePayIcon className={classes.svg} />
    </button>
  );
};

export default GooglePay;
