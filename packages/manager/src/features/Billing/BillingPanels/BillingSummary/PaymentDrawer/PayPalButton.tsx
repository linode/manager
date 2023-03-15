import { makePayment } from '@linode/api-v4/lib/account/payments';
import {
  BraintreePayPalButtons,
  CreateOrderBraintreeActions,
  FUNDING,
  OnApproveBraintreeActions,
  OnApproveBraintreeData,
  usePayPalScriptReducer,
} from '@paypal/react-paypal-js';
import * as React from 'react';
import { makeStyles } from '@mui/styles';
import Tooltip from 'src/components/core/Tooltip';
import CircleProgress from 'src/components/CircleProgress';
import Grid from 'src/components/Grid';
import { reportException } from 'src/exceptionReporting';
import { queryKey as accountBillingKey } from 'src/queries/accountBilling';
import { useClientToken } from 'src/queries/accountPayment';
import { queryClient } from 'src/queries/base';
import { SetSuccess } from './types';
import { APIError } from '@linode/api-v4/lib/types';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { useAccount } from 'src/queries/account';
import { getPaymentLimits } from 'src/features/Billing/billingUtils';

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
  renderError: (errorMsg: string) => JSX.Element;
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
  const [{ options, isPending }, dispatch] = usePayPalScriptReducer();
  const { data: account } = useAccount();

  const {
    usd,
    disabled: disabledDueToProcessing,
    setSuccess,
    setError,
    setProcessing,
    renderError,
  } = props;

  const { min, max } = getPaymentLimits(account?.balance);

  const disabledDueToPrice = +usd < min || +usd > max;

  React.useEffect(() => {
    /**
     * When the Braintree client token is received,
     * set the PayPal context only if the token has changed.
     * The '!==' statements makes sure we don't re-render
     * when this component is re-mounted.
     */
    if (
      data?.client_token &&
      options['data-client-token'] !== data.client_token
    ) {
      dispatch({
        type: 'resetOptions',
        value: {
          ...options,
          'data-client-token': data?.client_token,
        },
      });
    }
    // Intentionally only run this effect when client token data changes. We don't need to run
    // when the PayPal options change because we set them here with dispatch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  React.useEffect(() => {
    // On mount, if we were previously vaulting (adding a payment method),
    // set the PayPal options to capture a one time payment.
    if (
      options.vault === true ||
      options.commit === false ||
      options.intent !== 'capture'
    ) {
      dispatch({
        type: 'resetOptions',
        value: {
          ...options,
          vault: false,
          commit: true,
          intent: 'capture',
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const createOrder = (
    data: Record<string, unknown>,
    actions: CreateOrderBraintreeActions
  ): Promise<string> => {
    return actions.braintree.createPayment({
      flow: 'checkout',
      currency: 'USD',
      amount: stateRef!.current!.amount,
      intent: 'capture',
    });
  };

  const onApprove = async (
    data: OnApproveBraintreeData,
    actions: OnApproveBraintreeActions
  ) => {
    setProcessing(true);

    try {
      const payload = await actions.braintree.tokenizePayment(data);

      // send nonce to the Linode API
      const response = await makePayment({
        nonce: payload.nonce,
        usd: stateRef!.current!.amount,
      }).catch((error: APIError[]) => {
        // Process and surface any Linode API errors during payment
        const errorText = getAPIErrorOrDefault(
          error,
          'Unable to complete PayPal payment.'
        )[0].reason;
        setError(errorText);
        setProcessing(false);
      });
      if (response) {
        queryClient.invalidateQueries(`${accountBillingKey}-payments`);

        setSuccess(
          `Payment for $${response.usd} successfully submitted with PayPal`,
          true,
          response.warnings
        );
      }
    } catch (error) {
      // Process, surface, and log any Braintree errors during payment
      if (error.statusCode === 'CANCELED') {
        return;
      }

      const errorMsg = 'Unable to tokenize PayPal payment.';
      reportException(
        'Braintree was unable to tokenize PayPal one time payment.',
        { error }
      );
      setError(errorMsg);
      setProcessing(false);
    }
  };

  const onError = (error: any) => {
    if (error?.message?.includes('popup close')) {
      return;
    }
    reportException(
      'An error occurred when trying to make a one-time PayPal payment.',
      { error }
    );
  };

  if (clientTokenLoading || isPending || !options['data-client-token']) {
    return (
      <Grid
        container
        className={classes.loading}
        justifyContent="center"
        alignContent="center"
      >
        <CircleProgress mini />
      </Grid>
    );
  }

  if (clientTokenError) {
    return renderError('Error loading PayPal.');
  }

  return (
    <div className={classes.root}>
      {disabledDueToPrice && (
        <Tooltip
          title={`Payment amount must be between $${min} and $${max}`}
          data-qa-help-tooltip
          enterTouchDelay={0}
          leaveTouchDelay={5000}
        >
          <div className={classes.mask} />
        </Tooltip>
      )}
      <BraintreePayPalButtons
        style={{ height: 35 }}
        fundingSource={FUNDING.PAYPAL}
        disabled={disabledDueToPrice || disabledDueToProcessing}
        createOrder={createOrder}
        onApprove={onApprove}
        onError={onError}
      />
    </div>
  );
};

export default PayPalButton;
