import React, { useEffect } from 'react';
import { useClientToken } from 'src/queries/accountPayment';
import { makeStyles, Theme } from 'src/components/core/styles';
import HelpIcon from 'src/components/HelpIcon';
import CircleProgress from 'src/components/CircleProgress';
import { BraintreePayPalCheckoutTokenizationOptions } from '@paypal/react-paypal-js/dist/types/types/braintree/paypalCheckout';
import {
  BraintreePayPalButtons,
  CreateBillingAgreementActions,
  FUNDING,
  OnApproveBraintreeActions,
  usePayPalScriptReducer,
} from '@paypal/react-paypal-js';
import { queryClient } from 'src/queries/base';
import { queryKey as accountPaymentKey } from 'src/queries/accountPayment';
import { addPaymentMethod } from '@linode/api-v4/lib/account/payments';
import { useSnackbar } from 'notistack';
import { APIError } from '@linode/api-v4/lib/types';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { PaymentMethod } from '@linode/api-v4';
import classNames from 'classnames';

const useStyles = makeStyles((theme: Theme) => ({
  errorIcon: {
    color: theme.color.red,
    marginRight: -20,
    '&:hover': {
      color: theme.color.red,
      opacity: 0.7,
    },
    '& svg': {
      height: 28,
      width: 28,
    },
  },
  disabled: {
    // Allows us to disable the pointer on the PayPal button because the SDK does not
    pointerEvents: 'none',
  },
}));

interface Props {
  setProcessing: (processing: boolean) => void;
  onClose: () => void;
  disabled: boolean;
}

export const PayPalChip: React.FC<Props> = (props) => {
  const { onClose, disabled, setProcessing } = props;
  const { data, isLoading, error } = useClientToken();
  const [{ options }, dispatch] = usePayPalScriptReducer();
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();

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
          'data-client-token': data?.client_token,
          vault: true,
          commit: false,
          intent: 'tokenize',
          // billingAgreementDescription: 'You agree to allow Linode to charge you monthy.',
          ...options,
        },
      });
    }
  }, [data]);

  const createBillingAgreement = (
    _: Record<string, unknown>,
    actions: CreateBillingAgreementActions
  ) =>
    actions.braintree.createPayment({
      flow: 'vault',
      // The following are optional params
      // billingAgreementDescription: 'You agree to allow Linode to charge you monthy.',
    });

  const onApprove = async (
    data: BraintreePayPalCheckoutTokenizationOptions,
    actions: OnApproveBraintreeActions
  ) => {
    setProcessing(true);

    return actions.braintree
      .tokenizePayment(data)
      .then((payload) => onNonce(payload.nonce));
  };

  const onNonce = (nonce: string) => {
    const paymentMethods = queryClient.getQueryData<PaymentMethod[]>(
      `${accountPaymentKey}-all`
    );

    addPaymentMethod({
      type: 'payment_method_nonce',
      data: { nonce },
      is_default: paymentMethods?.length === 0,
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

        enqueueSnackbar(
          getAPIErrorOrDefault(errors, 'Unable to add payment method')[0]
            .reason,
          { variant: 'error' }
        );
      });
  };

  if (error) {
    return (
      <HelpIcon
        className={classes.errorIcon}
        isError={true}
        size={35}
        text="Error loading PayPal."
      />
    );
  }

  if (isLoading || !options['data-client-token']) {
    return <CircleProgress mini />;
  }

  return (
    <div
      className={classNames({
        [classes.disabled]: disabled,
      })}
    >
      <BraintreePayPalButtons
        disabled={disabled}
        style={{ height: 25 }}
        fundingSource={FUNDING.PAYPAL}
        createBillingAgreement={createBillingAgreement}
        onApprove={onApprove}
      />
    </div>
  );
};
