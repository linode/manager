import { APIWarning } from '@linode/api-v4/lib/types';
import * as React from 'react';
import GooglePayIcon from 'src/assets/icons/payment/gPayButton.svg';
import { CircleProgress } from 'src/components/CircleProgress';
import { makeStyles } from 'tss-react/mui';
import { Theme } from '@mui/material/styles';
import Tooltip from 'src/components/core/Tooltip';
import Grid from '@mui/material/Unstable_Grid2';
import { PaymentMessage } from 'src/features/Billing/BillingPanels/PaymentInfoPanel/AddPaymentMethodDrawer/AddPaymentMethodDrawer';
import { getPaymentLimits } from 'src/features/Billing/billingUtils';
import {
  gPay,
  initGooglePaymentInstance,
} from 'src/features/Billing/GooglePayProvider';
import { useScript } from 'src/hooks/useScript';
import { useAccount } from 'src/queries/account';
import { useClientToken } from 'src/queries/accountPayment';
import { SetSuccess } from './types';
import { QueryClient, useQueryClient } from 'react-query';

const useStyles = makeStyles()((theme: Theme) => ({
  button: {
    '& svg': {
      color: theme.name === 'light' ? '#fff' : '#616161',
      height: 16,
    },
    '&:hover': {
      opacity: 0.8,
      transition: 'none',
    },
    alignItems: 'center',
    backgroundColor: theme.name === 'light' ? '#000' : '#fff',
    border: 0,
    borderRadius: 4,
    cursor: 'pointer',
    display: 'flex',
    height: 35,
    justifyContent: 'center',
    [theme.breakpoints.down('md')]: {
      marginLeft: 0,
      width: '101.5%',
    },
    transition: theme.transitions.create(['opacity']),
    width: '100%',
  },
  disabled: {
    opacity: 0.3,
  },
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
  },
}));

interface Props {
  transactionInfo: google.payments.api.TransactionInfo;
  setSuccess: SetSuccess;
  setError: (error: string) => void;
  setProcessing: (processing: boolean) => void;
  renderError: (errorMsg: string) => JSX.Element;
  disabled: boolean;
}

export const GooglePayButton = (props: Props) => {
  const { classes, cx } = useStyles();
  const status = useScript('https://pay.google.com/gp/p/js/pay.js');
  const { data, error: clientTokenError, isLoading } = useClientToken();
  const queryClient = useQueryClient();
  const [initializationError, setInitializationError] = React.useState<boolean>(
    false
  );
  const { data: account } = useAccount();

  const {
    disabled: disabledDueToProcessing,
    renderError,
    setError,
    setProcessing,
    setSuccess,
    transactionInfo,
  } = props;

  const { max, min } = getPaymentLimits(account?.balance);

  const disabledDueToPrice =
    +transactionInfo.totalPrice < min || +transactionInfo.totalPrice > max;

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

  const handlePay = (queryClient: QueryClient) => {
    gPay(
      'one-time-payment',
      transactionInfo,
      handleMessage,
      setProcessing,
      queryClient
    );
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
          title={`Payment amount must be between $${min} and $${max}`}
          data-qa-help-tooltip
          enterTouchDelay={0}
          leaveTouchDelay={5000}
        >
          <div className={classes.mask} />
        </Tooltip>
      )}
      <button
        className={cx({
          [classes.button]: true,
          [classes.disabled]: disabledDueToPrice || disabledDueToProcessing,
        })}
        disabled={disabledDueToPrice || disabledDueToProcessing}
        onClick={() => handlePay(queryClient)}
        data-qa-button="gpayButton"
      >
        <GooglePayIcon />
      </button>
    </div>
  );
};

export default GooglePayButton;
