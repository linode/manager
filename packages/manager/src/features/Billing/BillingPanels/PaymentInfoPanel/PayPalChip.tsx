import React from 'react';
import classNames from 'classnames';
import braintree from 'braintree-web';
import HelpIcon from 'src/components/HelpIcon';
import CircleProgress from 'src/components/CircleProgress';
import { useClientToken } from 'src/queries/accountPayment';
import { useStyles } from './GooglePayChip';
import { useSnackbar } from 'notistack';
import { reportException } from 'src/exceptionReporting';
import { onSuccess } from '../../Providers/PayPal';

interface Props {
  setProcessing: (processing: boolean) => void;
  onClose: () => void;
  disabled: boolean;
}

export const PayPalChip: React.FC<Props> = (props) => {
  const classes = useStyles();
  const { onClose, disabled, setProcessing } = props;
  const { enqueueSnackbar } = useSnackbar();
  const [hasPaypalError, setHasPayPalError] = React.useState<boolean>(false);

  const {
    data,
    isLoading: isClientTokenLoading,
    error: hasClientTokenError,
  } = useClientToken();

  React.useEffect(() => {
    const init = async () => {
      if (data) {
        try {
          const clientInstance = await braintree.client.create({
            authorization: data.client_token,
          });

          const paypalCheckoutInstance = await braintree.paypalCheckout.create({
            client: clientInstance,
          });

          paypalCheckoutInstance.loadPayPalSDK(
            {
              vault: true,
              // @ts-expect-error Needed but types are wrong
              commit: false,
            },
            () => {
              // @ts-expect-error Needed but types are wrong
              paypal
                // @ts-expect-error Needed but types are wrong
                .Buttons({
                  style: {
                    height: 25,
                    // color: 'white',
                  },
                  fundingSource: 'paypal',
                  createBillingAgreement() {
                    return paypalCheckoutInstance.createPayment({
                      // @ts-expect-error Needed but types are wrong
                      flow: 'vault',
                      vault: true,
                      // @ts-expect-error Needed but types are wrong
                      intent: 'tokenize',
                      commit: false,
                      enableShippingAddress: false,
                    });
                  },
                  onApprove(data: any) {
                    return paypalCheckoutInstance.tokenizePayment(
                      data,
                      (err, payload) =>
                        onSuccess(
                          err,
                          payload,
                          enqueueSnackbar,
                          onClose,
                          setProcessing
                        )
                    );
                  },
                  onError(error: any) {
                    reportException(error, {
                      message: 'Paypal threw an error.',
                    });
                    // We probably don't want to expose the actual error to the user.
                    enqueueSnackbar(`Error ${error}`, {
                      variant: 'error',
                    });
                  },
                })
                .render('#paypal-button-add-as-payment-method')
                .then(() => {
                  // PayPal button is ready to use
                  // setIsPayPalLoading(false);
                });
            }
          );
        } catch (error) {
          setHasPayPalError(true);
        }
      }
    };
    init();
  }, [data]);

  if (hasClientTokenError || hasPaypalError) {
    return (
      <HelpIcon
        className={classes.errorIcon}
        text="Error loading Paypal"
        size={35}
        isError
      />
    );
  }

  if (isClientTokenLoading) {
    return <CircleProgress mini />;
  }

  return (
    <div
      style={{ marginRight: -8 }}
      className={classNames({
        [classes.disabled]: disabled,
      })}
    >
      <div id="paypal-button-add-as-payment-method"></div>
    </div>
  );
};
