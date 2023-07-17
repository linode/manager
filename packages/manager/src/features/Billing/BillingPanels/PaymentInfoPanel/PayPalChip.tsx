import { addPaymentMethod } from '@linode/api-v4/lib/account/payments';
import { APIError } from '@linode/api-v4/lib/types';
import Grid from '@mui/material/Unstable_Grid2';
import {
  BraintreePayPalButtons,
  CreateBillingAgreementActions,
  FUNDING,
  OnApproveBraintreeActions,
  OnApproveBraintreeData,
  usePayPalScriptReducer,
} from '@paypal/react-paypal-js';
import { useSnackbar } from 'notistack';
import React, { useEffect } from 'react';
import { QueryClient, useQueryClient } from 'react-query';
import { makeStyles } from 'tss-react/mui';

import { CircleProgress } from 'src/components/CircleProgress';
import { reportException } from 'src/exceptionReporting';
import { PaymentMessage } from 'src/features/Billing/BillingPanels/PaymentInfoPanel/AddPaymentMethodDrawer/AddPaymentMethodDrawer';
import { useClientToken } from 'src/queries/accountPayment';
import { queryKey as accountPaymentKey } from 'src/queries/accountPayment';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

const useStyles = makeStyles()(() => ({
  disabled: {
    // Allows us to disable the pointer on the PayPal button because the SDK does not
    pointerEvents: 'none',
  },
}));

interface Props {
  disabled: boolean;
  onClose: () => void;
  renderError: (errorMsg: string) => JSX.Element;
  setMessage: (message: PaymentMessage) => void;
  setProcessing: (processing: boolean) => void;
}

export const PayPalChip = (props: Props) => {
  const { disabled, onClose, renderError, setMessage, setProcessing } = props;
  const { data, error: clientTokenError, isLoading } = useClientToken();
  const [{ isPending, options }, dispatch] = usePayPalScriptReducer();
  const { classes, cx } = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  useEffect(() => {
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
    // On mount, if we were previously not vaulting (one time payment),
    // set the PayPal options to vault for adding a payment method.
    if (
      options.vault === false ||
      options.commit === true ||
      options.intent !== 'tokenize'
    ) {
      dispatch({
        type: 'resetOptions',
        value: {
          ...options,
          commit: false,
          intent: 'tokenize',
          vault: true,
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createBillingAgreement = (
    _: Record<string, unknown>,
    actions: CreateBillingAgreementActions
  ) =>
    actions.braintree.createPayment({
      flow: 'vault',
    });

  const onApprove = async (
    data: OnApproveBraintreeData,
    actions: OnApproveBraintreeActions
  ) => {
    setProcessing(true);

    return actions.braintree
      .tokenizePayment(data)
      .then((payload) => onNonce(payload.nonce, queryClient));
  };

  const onNonce = (nonce: string, queryClient: QueryClient) => {
    addPaymentMethod({
      data: { nonce },
      is_default: true,
      type: 'payment_method_nonce',
    })
      .then(() => {
        queryClient.invalidateQueries(`${accountPaymentKey}-all`);

        onClose();

        enqueueSnackbar('Successfully added PayPal', {
          variant: 'success',
        });
      })
      .catch((errors: APIError[]) => {
        setProcessing(false);

        const error = getAPIErrorOrDefault(
          errors,
          'Unable to add payment method'
        )[0].reason;

        enqueueSnackbar(error, { variant: 'error' });

        reportException(error, {
          message:
            'Failed to add PayPal as a payment method with Linode\u{2019}s API',
        });
      });
  };

  const onError = (error: any) => {
    if (error?.message?.includes('popup close')) {
      return;
    }
    reportException(
      'A PayPal error occurred preventing a user from adding PayPal as a payment method.',
      { error }
    );
    setMessage({
      text: 'Unable to open PayPal.',
      variant: 'error',
    });
  };

  if (clientTokenError) {
    return renderError('Error initializing PayPal');
  }

  if (isLoading || isPending || !options['data-client-token']) {
    return (
      <Grid>
        <CircleProgress mini />
      </Grid>
    );
  }

  return (
    <Grid
      className={cx({
        [classes.disabled]: disabled,
      })}
    >
      <BraintreePayPalButtons
        createBillingAgreement={createBillingAgreement}
        disabled={disabled}
        fundingSource={FUNDING.PAYPAL}
        onApprove={onApprove}
        onError={onError}
        style={{ height: 25 }}
      />
    </Grid>
  );
};
