import { useAccount, useClientToken } from '@linode/queries';
import { CircleProgress, Tooltip } from '@linode/ui';
import { useScript } from '@linode/utilities';
import Grid from '@mui/material/Grid';
import { useQueryClient } from '@tanstack/react-query';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import GooglePayIcon from 'src/assets/icons/payment/gPayButton.svg';
import { getPaymentLimits } from 'src/features/Billing/billingUtils';
import {
  gPay,
  initGooglePaymentInstance,
} from 'src/features/Billing/GooglePayProvider';

import type { SetSuccess } from './types';
import type { APIWarning } from '@linode/api-v4/lib/types';
import type { Theme } from '@mui/material/styles';
import type { QueryClient } from '@tanstack/react-query';
import type { PaymentMessage } from 'src/features/Billing/BillingPanels/PaymentInfoPanel/AddPaymentMethodDrawer/AddPaymentMethodDrawer';

const useStyles = makeStyles()((theme: Theme) => ({
  button: {
    '& svg': {
      color:
        theme.name === 'light'
          ? theme.tokens.color.Neutrals.White
          : theme.tokens.color.Neutrals[70],
      height: 16,
    },
    '&:hover': {
      opacity: 0.8,
      transition: 'none',
    },
    alignItems: 'center',
    backgroundColor:
      theme.name === 'light'
        ? theme.tokens.color.Neutrals.Black
        : theme.tokens.color.Neutrals.White,
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
  disabled: boolean;
  renderError: (errorMsg: string) => JSX.Element;
  setError: (error: string) => void;
  setProcessing: (processing: boolean) => void;
  setSuccess: SetSuccess;
  transactionInfo: google.payments.api.TransactionInfo;
}

export const GooglePayButton = (props: Props) => {
  const { classes, cx } = useStyles();
  const status = useScript('https://pay.google.com/gp/p/js/pay.js');
  const { data, error: clientTokenError, isLoading } = useClientToken();
  const queryClient = useQueryClient();
  const [initializationError, setInitializationError] =
    React.useState<boolean>(false);
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
      <button
        className={cx({
          [classes.button]: true,
          [classes.disabled]: disabledDueToPrice || disabledDueToProcessing,
        })}
        data-qa-button="gpayButton"
        disabled={disabledDueToPrice || disabledDueToProcessing}
        onClick={() => handlePay(queryClient)}
      >
        <GooglePayIcon />
      </button>
    </div>
  );
};
