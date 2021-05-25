import * as React from 'react';
import { useEffect } from 'react';
import { useLazyScript } from 'src/hooks/useScript';
import GooglePayIcon from 'src/assets/icons/payment/googlePay.svg';
import { ScriptStatus } from 'src/hooks/useScript';
import { makeStyles } from 'src/components/core/styles';
import GooglePayClient from 'src/features/Billing/Providers/GooglePay';

const useStyles = makeStyles(() => ({
  button: {
    border: 0,
    backgroundColor: 'transparent',
    padding: 0,
  },
}));

const GooglePay: React.FC<{}> = () => {
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
        totalPrice: '10.00',
      },
      // Temporary error handler
      (message) => alert(message)
    );
  };

  useEffect(() => {
    if (status == ScriptStatus.READY) {
      handlePay();
    }
  }, [status]);

  return (
    <button
      className={classes.button}
      onClick={status == ScriptStatus.READY ? handlePay : load}
    >
      <GooglePayIcon />
    </button>
  );
};

export default GooglePay;
