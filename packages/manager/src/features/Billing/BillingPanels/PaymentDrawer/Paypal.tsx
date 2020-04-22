import scriptLoader from 'react-async-script-loader';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { compose } from 'recompose';
import { Theme, makeStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import Tooltip from 'src/components/core/Tooltip';
import { PAYPAL_CLIENT_ENV } from 'src/constants';

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
  errorText?: string;
  enabled: boolean;
  createOrder: () => Promise<string | void>;
  onCancel: () => void;
  onApprove: (data: Paypal.AuthData) => void;
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
  const { enabled, isScriptLoaded, createOrder, onCancel, onApprove } = props;
  const classes = useStyles();

  /**
   * Has to be stored separately;
   * refs don't notify anyone that they've updated,
   * so the view won't update to use the loaded PaypalButton.
   *
   * otoh, trying to store the button in a useState causes
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

  return (
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

            <div data-qa-paypal-button className={classes.paypalButtonWrapper}>
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
  );
};

export default compose<CombinedProps, Props>(
  React.memo,
  scriptLoader(paypalScriptSrc())
)(PayPalDisplay);
