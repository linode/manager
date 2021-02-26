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
 * the createOrder callback is returned.
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
  stagePaypalPayment,
} from '@linode/api-v4/lib/account';
import * as classnames from 'classnames';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import CircleProgress from 'src/components/CircleProgress';
import { makeStyles, Theme } from 'src/components/core/styles';
import Tooltip from 'src/components/core/Tooltip';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import { PAYPAL_CLIENT_ENV } from 'src/constants';
import { reportException } from 'src/exceptionReporting';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import PaypalDialog from './PaymentBits/PaypalDialog';
import { SetSuccess } from './types';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: theme.spacing(4),
  },
  header: {
    fontSize: '1.1rem',
  },
  paypalMask: {
    width: 200,
    height: 38,
    position: 'absolute',
    zIndex: 10,
    left: 0,
    top: 0,
  },
  paypalButtonWrapper: {
    position: 'relative',
    left: theme.spacing(),
    zIndex: 1,
    transition: theme.transitions.create(['opacity']),
  },
  PaypalHidden: {
    opacity: 0.3,
  },
  text: {
    marginBottom: theme.spacing(2) - 1,
  },
}));

interface PaypalScript {
  isScriptLoaded?: boolean;
}
export interface Props {
  usd: string;
  setSuccess: SetSuccess;
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
    'AWdnFJ_Yx5X9uqKZQdbdkLfCnEJwtauQJ2tyesKf3S0IxSrkRLmB2ZN2ACSwy37gxY_AZoTagHWlZCOA',
};

const paypalSrcQueryParams = `&disable-funding=card,credit&currency=USD&commit=false&intent=capture`;

export const paypalScriptSrc = () => {
  return `https://www.paypal.com/sdk/js?client-id=${client[PAYPAL_CLIENT_ENV]}${paypalSrcQueryParams}`;
};

export const PayPalDisplay: React.FC<CombinedProps> = props => {
  const { isScriptLoaded, usd, setSuccess } = props;
  const classes = useStyles();

  const [dialogOpen, setDialogOpen] = React.useState<boolean>(false);
  const [isStagingPayment, setStaging] = React.useState<boolean>(false);
  const [isExecutingPayment, setExecuting] = React.useState<boolean>(false);
  const [paymentFailed, setPaymentFailed] = React.useState<boolean>(false);

  const [payerID, setPayerID] = React.useState<string>('');
  const [paymentID, setPaymentID] = React.useState<string>('');

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
  const [
    errorLoadingPaypalScript,
    setErrorLoadingPaypalScript,
  ] = React.useState<boolean | undefined>();

  React.useEffect(() => {
    const isPayPalInitialized = window.hasOwnProperty('paypal');

    if (isScriptLoaded && isPayPalInitialized && !shouldRenderButton) {
      /*
       * Because the paypal script is now loaded, we have access to this React component
       * in the window element. This will be used in the render method.
       * See documentation here:
       * https://github.com/paypal/paypal-checkout-components/blob/master/demo/react.htm
       */
      PaypalButton.current = (window as any).paypal.Buttons.driver('react', {
        React,
        ReactDOM,
      });
      setErrorLoadingPaypalScript(false);
      setShouldRenderButton(true);
    }
  }, [isScriptLoaded, shouldRenderButton]);

  React.useEffect(() => {
    const timeout: NodeJS.Timeout = setTimeout(() => {
      if ('paypal' in window === false) {
        setErrorLoadingPaypalScript(true);
      }
    }, 2000);

    return () => clearTimeout(timeout);
  }, []);

  /**
   * user submits payment and we send APIv4 request to confirm paypal payment
   */
  const confirmPaypalPayment = () => {
    setExecuting(true);
    executePaypalPayment({
      payer_id: payerID,
      payment_id: paymentID,
    })
      .then(response => {
        setExecuting(false);
        setDialogOpen(false);
        setSuccess(
          `Payment for $${usd} successfully submitted`,
          true,
          response.warnings
        );
      })
      .catch(_ => {
        setExecuting(false);
        setPaymentFailed(true);
      });
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
    setPaymentFailed(false);
    setSuccess(null);

    return stagePaypalPayment({
      cancel_url: 'https://www.paypal.com/checkoutnow/error',
      redirect_url: 'https://www.paypal.com/checkoutnow/error',
      usd: (+usd).toFixed(2),
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
          'Unable to complete PayPal payment.'
        )[0].reason;

        /**
         * Send the error off to sentry with the USD amount in the tags
         */
        reportException(cleanedError, {
          'Raw USD': usd,
          'USD converted to number': (+usd).toFixed(2),
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

  const enabled = shouldEnablePaypalButton(+usd);

  if (typeof errorLoadingPaypalScript === 'undefined') {
    return (
      <Grid container direction="column" className={classes.root}>
        <CircleProgress mini />
      </Grid>
    );
  }

  if (errorLoadingPaypalScript) {
    return (
      <Grid container direction="column" className={classes.root}>
        <Notice error text="There was an error connecting with PayPal." />
      </Grid>
    );
  }

  return (
    <>
      <Grid container direction="column" className={classes.root}>
        <Grid item>
          <Typography variant="h3" className={classes.header}>
            <strong>Pay via PayPal</strong>
          </Typography>
        </Grid>
        <Grid item>
          <Typography className={classes.text}>
            You'll be taken to PayPal to complete your payment.
          </Typography>
        </Grid>
        <Grid container alignItems="flex-end" justify="flex-start">
          <Grid item style={{ position: 'relative' }}>
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
              className={classnames({
                [classes.paypalButtonWrapper]: true,
                [classes.PaypalHidden]: !enabled,
              })}
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
                    shape: 'rect',
                  }}
                />
              )}
            </div>
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

export const isAllowedUSDAmount = (usd: number) => {
  return !!(usd >= 5 && usd <= 10000);
};

export const shouldEnablePaypalButton = (value: number | undefined) => {
  /**
   * paypal button should be disabled if there is either
   * no value entered or it's below $5 or over $500 as per APIv4 requirements
   */

  if (!value || !isAllowedUSDAmount(value)) {
    return false;
  }
  return true;
};

export default React.memo(PayPalDisplay);
