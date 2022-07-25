import { APIWarning } from '@linode/api-v4/lib/types';
import classNames from 'classnames';
import * as React from 'react';
import GooglePayIcon from 'src/assets/icons/payment/gPayButton.svg';
import CircleProgress from 'src/components/CircleProgress';
import { makeStyles, Theme } from 'src/components/core/styles';
import Tooltip from 'src/components/core/Tooltip';
import Grid from 'src/components/Grid';
import { PaymentMessage } from 'src/features/Billing/BillingPanels/PaymentInfoPanel/AddPaymentMethodDrawer/AddPaymentMethodDrawer';
import {
  gPay,
  initGooglePaymentInstance,
} from 'src/features/Billing/GooglePayProvider';
import { useScript } from 'src/hooks/useScript';
import { useClientToken } from 'src/queries/accountPayment';
import { SetSuccess } from './types';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    position: 'relative',
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.name === 'lightTheme' ? '#000' : '#fff',
    border: 0,
    borderRadius: 4,
    cursor: 'pointer',
    height: 35,
    width: '100%',
    transition: theme.transitions.create(['opacity']),
    '&:hover': {
      opacity: 0.8,
      transition: 'none',
    },
    '& svg': {
      color: theme.name === 'lightTheme' ? '#fff' : '#616161',
      height: 16,
    },
    [theme.breakpoints.down('sm')]: {
      marginLeft: 0,
      width: '101.5%',
    },
  },
  loading: {
    padding: 4,
  },
  disabled: {
    opacity: 0.3,
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
  transactionInfo: google.payments.api.TransactionInfo;
  balance: false | number;
  setSuccess: SetSuccess;
  setError: (error: string) => void;
  setProcessing: (processing: boolean) => void;
  renderError: (errorMsg: string) => JSX.Element;
  disabled: boolean;
}

export const GooglePayButton: React.FC<Props> = (props) => {
  const classes = useStyles();
  const status = useScript('https://pay.google.com/gp/p/js/pay.js');
  const { data, isLoading, error: clientTokenError } = useClientToken();
  const [initializationError, setInitializationError] = React.useState<boolean>(
    false
  );

  const {
    transactionInfo,
    balance,
    disabled: disabledDueToProcessing,
    setSuccess,
    setError,
    setProcessing,
    renderError,
  } = props;

  /**
   * We're following API's validation logic:
   *
   * GPay min is $5, max of $2000.
   * If the customer has a balance over $2000, then the max is $50000
   */
  const disabledDueToPrice =
    +transactionInfo.totalPrice < 5 ||
    (+transactionInfo.totalPrice > 2000 && balance < 2000) ||
    +transactionInfo.totalPrice > 50000;

  React.useEffect(() => {
    const init = async () => {
      if (status === 'ready' && data) {
        const { error } = await initGooglePaymentInstance(
          data.client_token as string
        );
        if (error) {
          setInitializationError(true);
        }
      }
    };
    init();
  }, [status, data]);

  const handleMessage = (message: PaymentMessage, warning?: APIWarning[]) => {
    if (message.variant === 'error') {
      setError(message.text);
    } else if (message.variant === 'success') {
      setSuccess(message.text, true, warning);
    }
  };

  const handlePay = () => {
    gPay('one-time-payment', transactionInfo, handleMessage, setProcessing);
  };

  if (status === 'error' || clientTokenError) {
    return renderError('Error loading Google Pay.');
  }

  if (initializationError) {
    return renderError('Error initializing Google Pay.');
  }

  if (isLoading) {
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

  return (
    <div className={classes.root}>
      {disabledDueToPrice && (
        <Tooltip
          title={`Payment amount must be between $5 and ${
            balance > 2000 ? '$50000' : '$2000'
          }`}
          data-qa-help-tooltip
          enterTouchDelay={0}
          leaveTouchDelay={5000}
        >
          <div className={classes.mask} />
        </Tooltip>
      )}
      <button
        className={classNames({
          [classes.button]: true,
          [classes.disabled]: disabledDueToPrice || disabledDueToProcessing,
        })}
        disabled={disabledDueToPrice || disabledDueToProcessing}
        onClick={handlePay}
        data-qa-button="gpayButton"
      >
        <GooglePayIcon />
      </button>
    </div>
  );
};

export default GooglePayButton;
