import * as React from 'react';
import { APIWarning } from '@linode/api-v4/lib/types';
import classNames from 'classnames';
import { VariantType } from 'notistack';
import { makeStyles, Theme } from 'src/components/core/styles';
import { useScript } from 'src/hooks/useScript';
import { useClientToken } from 'src/queries/accountPayment';
import { SetSuccess } from './types';
import {
  initGooglePaymentInstance,
  gPay,
} from 'src/features/Billing/Providers/GooglePay';
import GooglePayIcon from 'src/assets/icons/payment/gPayButton.svg';
import Notice from 'src/components/Notice';
import Tooltip from 'src/components/core/Tooltip';
import CircleProgress from 'src/components/CircleProgress';
import Grid from 'src/components/Grid';
import { reportException } from 'src/exceptionReporting';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    position: 'relative',
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.cmrBGColors.bgGooglePay,
    border: 0,
    borderRadius: 4,
    cursor: 'pointer',
    height: 35,
    width: '100%',
    transition: theme.transitions.create(['opacity']),
    '&:hover': {
      opacity: 0.8,
      transition: 'none',
      background: theme.cmrBGColors.bgGooglePay,
    },
    '& svg': {
      color: theme.cmrTextColors.textGooglePay,
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
        try {
          await initGooglePaymentInstance(data.client_token as string);
        } catch (error) {
          reportException(error, {
            message: 'Error initializing Google Pay.',
          });
          setInitializationError(true);
        }
      }
    };
    init();
  }, [status, data]);

  const handleMessage = (
    message: string,
    variant: VariantType,
    warning?: APIWarning[]
  ) => {
    if (variant === 'error') {
      setError(message);
    } else if (variant === 'success') {
      setSuccess(message, true, warning);
    }
  };

  const handlePay = () => {
    gPay('one-time-payment', transactionInfo, handleMessage, setProcessing);
  };

  if (status === 'error' || clientTokenError) {
    return <Notice error text="Error loading Google Pay." />;
  }

  if (initializationError) {
    return <Notice error text="Error initializing Google Pay." />;
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
