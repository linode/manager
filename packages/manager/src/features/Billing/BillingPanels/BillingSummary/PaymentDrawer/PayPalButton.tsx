import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import { useClientToken } from 'src/queries/accountPayment';
import { SetSuccess } from './types';
import Notice from 'src/components/Notice';
import Tooltip from 'src/components/core/Tooltip';
import CircleProgress from 'src/components/CircleProgress';
import Grid from 'src/components/Grid';
import {
  PayPalScriptProvider,
  PayPalButtons,
  FUNDING,
} from '@paypal/react-paypal-js';
import { unstable_batchedUpdates } from 'react-dom';
import { client, paypalCheckout } from 'braintree-web';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    position: 'relative',
  },
  loading: {
    padding: 4,
  },
  mask: {
    width: 200,
    height: 38,
    position: 'absolute',
    zIndex: 10,
    left: 0,
    top: 0,
  },
}));

interface Props {
  usd: number;
  setSuccess: SetSuccess;
  setError: (error: string) => void;
  setProcessing: (processing: boolean) => void;
  disabled: boolean;
}

export const PayPalButton: React.FC<Props> = (props) => {
  const classes = useStyles();
  const {
    data,
    isLoading: clientTokenLoading,
    error: clientTokenError,
  } = useClientToken();

  const {
    usd,
    disabled: disabledDueToProcessing,
    // setSuccess,
    // setError,
    // setProcessing,
  } = props;

  const disabledDueToPrice = usd < 5 || usd > 10000;

  const [payPalLoadingError, setPayPalLoadingError] = React.useState<boolean>(
    false
  );
  const [
    payPalCheckoutInstance,
    setPayPalCheckoutInstance,
  ] = React.useState<any>();

  React.useEffect(() => {
    if (data?.client_token) {
      loadBraintreeClient(data.client_token);
    }
  }, [data]);

  const loadBraintreeClient = async (token: string) => {
    try {
      const clientInstance = await client.create({ authorization: token });
      const checkoutInstance = await paypalCheckout.create({
        client: clientInstance,
      });

      unstable_batchedUpdates(() => {
        setPayPalCheckoutInstance(checkoutInstance);
      });
    } catch (e) {
      setPayPalLoadingError(true);
    }
  };

  const createOrder = () => {
    return payPalCheckoutInstance.createPayment({
      flow: 'checkout',
      currency: 'USD',
      amount: usd,
      intent: 'capture',
    });
  };

  const onApprove = (data: any) => {
    return payPalCheckoutInstance
      .tokenizePayment(data)
      .then((payload: unknown) => {
        // send nonce to server
        console.log(payload.nonce)
      });
  };

  if (clientTokenLoading) {
    return (
      <Grid
        container
        className={classes.loading}
        justify="center"
        alignContent="center"
      >
        <CircleProgress mini />
      </Grid>
    );
  }

  if (status === 'error' || clientTokenError || payPalLoadingError) {
    return <Notice error text="Error loading PayPal." />;
  }

  return (
    <div className={classes.root}>
      {disabledDueToPrice && (
        <Tooltip
          title="Payment amount must be between $5 and $10000"
          data-qa-help-tooltip
          enterTouchDelay={0}
          leaveTouchDelay={5000}
        >
          <div className={classes.mask} />
        </Tooltip>
      )}
      <PayPalScriptProvider
        options={{
          'client-id':
            'AXrQzrp1Fwa5VQwDv9uQZ6mySQZpvrozT92ezyYh-QbKTIpiqACbfxjI-RF1ueXkUQGKapgIQFZ5Iehk',
          'data-client-token': data?.client_token,
        }}
      >
        <PayPalButtons
          style={{ height: 35 }}
          fundingSource={FUNDING.PAYPAL}
          disabled={disabledDueToPrice || disabledDueToProcessing}
          createOrder={createOrder}
          onApprove={onApprove}
          /**
           * We need to re-render the button if the amount changes
           * https://paypal.github.io/react-paypal-js/?path=/docs/example-paypalbuttons--dynamic-amount
           * https://github.com/paypal/paypal-checkout-components/issues/1693
           */
          forceReRender={[usd]}
        />
      </PayPalScriptProvider>
    </div>
  );
};

export default PayPalButton;
