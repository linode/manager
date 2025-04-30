import { makePayment } from '@linode/api-v4/lib/account/payments';
import { CircleProgress, Tooltip } from '@linode/ui';
import Grid from '@mui/material/Grid2';
import {
  BraintreePayPalButtons,
  FUNDING,
  usePayPalScriptReducer,
} from '@paypal/react-paypal-js';
import { useQueryClient } from '@tanstack/react-query';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import { reportException } from 'src/exceptionReporting';
import { getPaymentLimits } from 'src/features/Billing/billingUtils';
import { useAccount, useClientToken, accountQueries } from '@linode/queries';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import type { SetSuccess } from './types';
import type { APIError } from '@linode/api-v4/lib/types';
import type {
  CreateOrderBraintreeActions,
  OnApproveBraintreeActions,
  OnApproveBraintreeData,
} from '@paypal/react-paypal-js';

const useStyles = makeStyles()(() => ({
  loading: {
    padding: 4,
  },
  mask: {
    height: 38,
    left: 0,
    position: 'absolute',
    top: 0,
    width: 200,
    zIndex: 10,
  },
  root: {
    position: 'relative',
    // We pass colorScheme: none to fix a dark mode issue
    // https://github.com/paypal/paypal-js/issues/584#issuecomment-2652308317
    colorScheme: 'none',
  },
}));

interface Props {
  disabled: boolean;
  renderError: (errorMsg: string) => JSX.Element;
  setError: (error: string) => void;
  setProcessing: (processing: boolean) => void;
  setSuccess: SetSuccess;
  usd: string;
}

interface TransactionInfo {
  amount: string;
  orderID: string;
}

export const PayPalButton = (props: Props) => {
  const { classes } = useStyles();
  const {
    data,
    error: clientTokenError,
    isLoading: clientTokenLoading,
  } = useClientToken();
  const [{ isPending, options }, dispatch] = usePayPalScriptReducer();
  const { data: account } = useAccount();
  const queryClient = useQueryClient();

  const {
    disabled: disabledDueToProcessing,
    renderError,
    setError,
    setProcessing,
    setSuccess,
    usd,
  } = props;

  const { max, min } = getPaymentLimits(account?.balance);

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
          commit: true,
          intent: 'capture',
          vault: false,
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
      amount: stateRef!.current!.amount,
      currency: 'USD',
      flow: 'checkout',
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
        queryClient.invalidateQueries({
          queryKey: accountQueries.payments._def,
        });

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
    setError('Unable to open PayPal.');
  };

  if (clientTokenLoading || isPending || !options['data-client-token']) {
    return (
      <Grid
        className={classes.loading}
        container
        sx={{
          alignContent: 'center',
          justifyContent: 'center',
        }}
      >
        <CircleProgress size="sm" />
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
          data-qa-help-tooltip
          enterTouchDelay={0}
          leaveTouchDelay={5000}
          title={`Payment amount must be between $${min} and $${max}`}
        >
          <div className={classes.mask} />
        </Tooltip>
      )}
      <BraintreePayPalButtons
        createOrder={createOrder}
        disabled={disabledDueToPrice || disabledDueToProcessing}
        fundingSource={FUNDING.PAYPAL}
        onApprove={onApprove}
        onError={onError}
        style={{ height: 35 }}
      />
    </div>
  );
};
