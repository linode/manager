/**
 * When viewing the PayPal code, please keep in mind the following flow
 *
 * 1. Make API call to v4/paypal to stage our paypal payment
 * 2. Return an order id in the createOrder callback
 * 3. Set payment_id state with the payment_id provided by Paypal
 * 4. Finally, POST to v4/paypal/execute
 *
 * These things must happen in this order or the paypal payment will not
 * process correctly. It is imperative that the APIv4 staging call happens before
 * the the createOrder callback is returned.
 *
 * For all documentation, see below:
 *
 * https://developer.paypal.com/docs/checkout/
 * https://developer.paypal.com/docs/checkout/integrate/
 *
 * We are **NOT** using the legacy PayPal version so please disregard any legacy
 * instructions
 *
 */
import {
  executePaypalPayment,
  stagePaypalPayment
} from 'linode-js-sdk/lib/account';
import scriptLoader from 'react-async-script-loader';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { compose } from 'recompose';
import { Theme, makeStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import Tooltip from 'src/components/core/Tooltip';
import Notice from 'src/components/Notice';
import { PAYPAL_CLIENT_ENV } from 'src/constants';
import PaypalDialog from './PaymentBits/PaypalDialog';
import { reportException } from 'src/exceptionReporting';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    paddingTop: theme.spacing(3)
  },
  header: {
    fontSize: '1.2rem'
  },
  paypalMask: {
    width: 175,
    height: 45,
    position: 'absolute',
    zIndex: 10,
    left: theme.spacing(2),
    top: theme.spacing(2)
  },
  paypalButtonWrapper: {
    position: 'relative',
    zIndex: 1
  },
  PaypalHidden: {
    opacity: 0.3
  }
}));

interface PaypalScript {
  isScriptLoadSucceed?: boolean;
  isScriptLoaded?: boolean;
  onScriptLoaded?: () => void;
}

export interface Props {
  enabled: boolean;
  usd: string;
  setSuccess: (message: string | null) => void;
}

type CombinedProps = Props & PaypalScript;

type PaypalButtonType = React.ComponentType<Paypal.PayButtonProps> | undefined;

/*
 * Client Script src for Linode Paypal Apps
 */
const client = {
  sandbox: 'sb',
  // 'YbjxBCou-0Aum1f2K1xqSgrJqhNCHOEbdmvi1pPQhk-bj_dLrJ41Cssm_ektzlNxZJc9A-dx6UkYu2n',
  production:
    'AWdnFJ_Yx5X9uqKZQdbdkLfCnEJwtauQJ2tyesKf3S0IxSrkRLmB2ZN2ACSwy37gxY_AZoTagHWlZCOA'
};

const paypalSrcQueryParams = `&disable-funding=card,credit&currency=USD&commit=false&intent=capture`;

const paypalScriptSrc = () => {
  return `https://www.paypal.com/sdk/js?client-id=${client[PAYPAL_CLIENT_ENV]}${paypalSrcQueryParams}`;
};

export const PayPalDisplay: React.FC<CombinedProps> = props => {
  const { enabled, isScriptLoaded, usd, setSuccess } = props;
  const classes = useStyles();

  const [dialogOpen, setDialogOpen] = React.useState<boolean>(false);
  const [isStagingPayment, setStaging] = React.useState<boolean>(false);
  const [isExecutingPayment, setExecuting] = React.useState<boolean>(false);
  const [paymentFailed, setPaymentFailed] = React.useState<boolean>(false);

  const [payerID, setPayerID] = React.useState<string>('');
  const [paymentID, setPaymentID] = React.useState<string>('');

  const [error, setError] = React.useState<string | null>(null);

  /**
   * Has to be stored separately;
   * refs don't notify anyone that they've updated,
   * so the view won't update to use the loaded PaypalButton.
   *
   * otoh, trying to store the button component in a useState causes
   * an explosion for unknown reasons. So a separate boolean
   * tracking value is necessary.
   */
  const PaypalButton = React.useRef<PaypalButtonType>();
  const [shouldRenderButton, setShouldRenderButton] = React.useState<boolean>(
    false
  );

  React.useEffect(() => {
    const isPayPalInitialized = window.hasOwnProperty('paypal');

    if (isScriptLoaded && isPayPalInitialized) {
      /*
       * Because the paypal script is now loaded, we have access to this React component
       * in the window element. This will be used in the render method.
       * See documentation here:
       * https://github.com/paypal/paypal-checkout-components/blob/master/demo/react.htm
       */
      PaypalButton.current = (window as any).paypal.Buttons.driver('react', {
        React,
        ReactDOM
      });
      setShouldRenderButton(true);
    }
  }, [isScriptLoaded]);

  /**
   * user submits payment and we send APIv4 request to confirm paypal payment
   */
  const confirmPaypalPayment = () => {
    setExecuting(true);
    executePaypalPayment({
      payer_id: payerID,
      payment_id: paymentID
    })
      .then(() => {
        setExecuting(false);
        setDialogOpen(false);
        setSuccess(`Payment for $${usd} successfully submitted`);
      })
      .catch(_ => {
        setExecuting(false);
        setPaymentFailed(true);
      });
  };

  const handleOpen = () => {
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
  };

  /**
   * Once the user authorizes the payment on Paypal's website. This functions
   * runs at the point when the user clicks "confirm" on paypal's website
   * and returns back to cloud manager
   *
   * @param data - information that Paypal returns to then send to
   * /account/payment/paypal/execute
   * @param actions - handlers to do more things. Optional argument that we
   * don't really need
   *
   * See documentation:
   * https://github.com/paypal/paypal-checkout-components/blob/master/docs/implement-checkout.md
   */
  const onApprove = (data: Paypal.AuthData) => {
    setPayerID(data.payerID);
  };

  /**
   * Callback function which serves the purpose of providing Paypal with
   * the order_id that we get from APIv4. It is imperative that this step happens before
   * we make the call to v4/execute.
   *
   * It is also imperative that this function returns the checkout_id returned from APIv4.
   * checkout_id is the same thing as order_id
   */
  const createOrder = () => {
    setDialogOpen(true);
    setStaging(true);
    setError(null);
    setPaymentFailed(false);
    setSuccess(null);

    return stagePaypalPayment({
      cancel_url: 'https://www.paypal.com/checkoutnow/error',
      redirect_url: 'https://www.paypal.com/checkoutnow/error',
      usd: (+usd).toFixed(2)
    })
      .then(response => {
        setStaging(false);
        setPaymentID(response.payment_id);
        return response.checkout_token;
      })
      .catch(errorResponse => {
        /** For sentry purposes only */
        const cleanedError = getAPIErrorOrDefault(
          errorResponse,
          'Something went wrong with the call to Linode /v4/account/paypal. See tags for USD info'
        )[0].reason;

        /**
         * Send the error off to sentry with the USD amount in the tags
         */
        reportException(cleanedError, {
          'Raw USD': usd,
          'USD converted to number': (+usd).toFixed(2)
        });

        setStaging(false);
        setPaymentFailed(true);
      });
  };

  /*
   * User was navigated to Paypal's site and then cancelled the payment and came back
   * to cloud manager
   *
   * See documentation:
   * https://github.com/paypal/paypal-checkout-components/blob/master/docs/implement-checkout.md
   */
  const onCancel = () => {
    setSuccess('Payment Cancelled');
    setDialogOpen(false);
  };

  return (
    <>
      <Grid container direction="column" className={classes.root}>
        <Grid item>
          <Typography className={classes.header}>
            <strong>Pay via PayPal</strong>
          </Typography>
        </Grid>
        <Grid item>
          <Typography>
            You'll be taken to PayPal to complete your payment.
          </Typography>
        </Grid>
        <Grid container alignItems="flex-end" justify="flex-start">
          <Grid item>
            <React.Fragment>
              {!enabled && (
                <Tooltip
                  title={'Amount to charge must be between $5 and $10000'}
                  data-qa-help-tooltip
                  enterTouchDelay={0}
                  leaveTouchDelay={5000}
                >
                  <div className={classes.paypalMask} />
                </Tooltip>
              )}

              <div
                data-qa-paypal-button
                className={classes.paypalButtonWrapper}
              >
                {PaypalButton.current && shouldRenderButton && (
                  <PaypalButton.current
                    env={PAYPAL_CLIENT_ENV as 'sandbox' | 'production'}
                    client={client}
                    createOrder={createOrder}
                    onApprove={onApprove}
                    onCancel={onCancel}
                    style={{
                      color: 'blue',
                      shape: 'rect'
                    }}
                  />
                )}
              </div>
            </React.Fragment>
          </Grid>
        </Grid>
      </Grid>
      <PaypalDialog
        open={dialogOpen}
        closeDialog={handleClose}
        isExecutingPayment={isExecutingPayment}
        isStagingPaypalPayment={isStagingPayment}
        initExecutePayment={confirmPaypalPayment}
        paypalPaymentFailed={paymentFailed}
        usd={(+usd).toFixed(2)}
      />
    </>
  );
};

export default compose<CombinedProps, Props>(
  React.memo,
  scriptLoader(paypalScriptSrc())
)(PayPalDisplay);
