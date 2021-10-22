import { makePayment } from '@linode/api-v4/lib/account/payments';
import {
  PayPalScriptProvider,
  PayPalButtons,
  FUNDING,
} from '@paypal/react-paypal-js';
import { client, paypalCheckout } from 'braintree-web';
import * as React from 'react';
import { unstable_batchedUpdates } from 'react-dom';
import { makeStyles } from 'src/components/core/styles';
import Tooltip from 'src/components/core/Tooltip';
import CircleProgress from 'src/components/CircleProgress';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import { PAYPAL_CLIENT_ID } from 'src/constants';
import { reportException } from 'src/exceptionReporting';
import { queryKey as accountBillingKey } from 'src/queries/accountBilling';
import { useClientToken } from 'src/queries/accountPayment';
import { queryClient } from 'src/queries/base';
import { SetSuccess } from './types';

const useStyles = makeStyles(() => ({
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
  usd: string;
  setSuccess: SetSuccess;
  setError: (error: string) => void;
  setProcessing: (processing: boolean) => void;
  disabled: boolean;
}

interface TransactionInfo {
  amount: string;
  orderID: string;
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
    setSuccess,
    setError,
    setProcessing,
  } = props;

  const disabledDueToPrice = +usd < 5 || +usd > 10000;

  const [
    payPalInitializationError,
    setPayPalInitializationError,
  ] = React.useState<boolean>(false);

  const [
    payPalCheckoutInstance,
    setPayPalCheckoutInstance,
  ] = React.useState<any>();

  /**
   * Needed to pass dynamic amount to PayPal without re-render
   * https://github.com/paypal/react-paypal-js/issues/161
   */
  const stateRef = React.useRef<TransactionInfo>();

  const [transaction, setTransaction] = React.useState<TransactionInfo>({
    amount: usd,
    orderID: '',
  });

  React.useEffect(() => {
    setTransaction({
      amount: usd,
      orderID: '',
    });
  }, [usd]);

  stateRef.current = transaction;

  React.useEffect(() => {
    if (data?.client_token) {
      initPayPalCheckout(data.client_token);
    }
  }, [data]);

  const initPayPalCheckout = async (token: string) => {
    try {
      const clientInstance = await client.create({ authorization: token });
      const checkoutInstance = await paypalCheckout.create({
        client: clientInstance,
      });

      unstable_batchedUpdates(() => {
        setPayPalCheckoutInstance(checkoutInstance);
      });
    } catch (error) {
      reportException(error, {
        message: 'Error initializing PayPal.',
      });
      setPayPalInitializationError(true);
    }
  };

  const createOrder = (): Promise<string> => {
    return payPalCheckoutInstance.createPayment({
      flow: 'checkout',
      currency: 'USD',
      amount: stateRef!.current!.amount,
      intent: 'capture',
    });
  };

  const onApprove = async (data: any) => {
    setProcessing(true);
    const payload = await payPalCheckoutInstance.tokenizePayment(data);

    // send nonce to server
    try {
      const response = await makePayment({
        nonce: payload.nonce,
        usd: stateRef!.current!.amount,
      });
      queryClient.invalidateQueries(`${accountBillingKey}-payments`);

      setProcessing(false);
      setSuccess(
        `Payment for $${
          stateRef!.current!.amount
        } successfully submitted with PayPal`,
        true,
        response.warnings
      );
    } catch (error) {
      if (error.statusCode === 'CANCELED') {
        return;
      }

      const errorMsg = 'Unable to complete PayPal payment.';
      reportException(error, {
        message: errorMsg,
      });
      setError(errorMsg);
    }
  };

  if (clientTokenLoading || !payPalCheckoutInstance) {
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

  if (clientTokenError) {
    return <Notice error text="Error loading PayPal." />;
  }

  if (payPalInitializationError) {
    return <Notice error text="Error initializing PayPal." />;
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
          'client-id': PAYPAL_CLIENT_ID,
          'data-client-token': data?.client_token,
        }}
      >
        {payPalCheckoutInstance ? (
          <PayPalButtons
            style={{ height: 35 }}
            fundingSource={FUNDING.PAYPAL}
            disabled={disabledDueToPrice || disabledDueToProcessing}
            createOrder={createOrder}
            onApprove={onApprove}
          />
        ) : null}
      </PayPalScriptProvider>
    </div>
  );
};

export default PayPalButton;
