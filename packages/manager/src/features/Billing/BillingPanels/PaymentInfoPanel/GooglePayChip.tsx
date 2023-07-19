import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';
import { useQueryClient } from 'react-query';
import { makeStyles } from 'tss-react/mui';

import GooglePayIcon from 'src/assets/icons/payment/googlePay.svg';
import { CircleProgress } from 'src/components/CircleProgress';
import { PaymentMessage } from 'src/features/Billing/BillingPanels/PaymentInfoPanel/AddPaymentMethodDrawer/AddPaymentMethodDrawer';
import {
  gPay,
  initGooglePaymentInstance,
} from 'src/features/Billing/GooglePayProvider';
import { useScript } from 'src/hooks/useScript';
import { useClientToken } from 'src/queries/accountPayment';

const useStyles = makeStyles()(() => ({
  button: {
    '&:hover': {
      opacity: 0.7,
    },
    backgroundColor: 'transparent',
    border: 0,
    cursor: 'pointer',
    padding: 0,
  },
  disabled: {
    '&:hover': {
      opacity: 0.3,
    },
    cursor: 'default',
    opacity: 0.3,
  },
}));

interface Props {
  disabled: boolean;
  onClose: () => void;
  renderError: (errorMsg: string) => JSX.Element;
  setMessage: (message: PaymentMessage) => void;
  setProcessing: (processing: boolean) => void;
}

export const GooglePayChip = (props: Props) => {
  const {
    disabled: disabledDueToProcessing,
    onClose,
    renderError,
    setMessage,
    setProcessing,
  } = props;
  const { classes, cx } = useStyles();
  const status = useScript('https://pay.google.com/gp/p/js/pay.js');
  const { data, error: clientTokenError, isLoading } = useClientToken();
  const queryClient = useQueryClient();
  const [initializationError, setInitializationError] = React.useState<boolean>(
    false
  );

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

  const handleMessage = (message: PaymentMessage) => {
    setMessage(message);
    if (message.variant === 'success') {
      onClose();
    }
  };

  const handlePay = () => {
    gPay(
      'add-recurring-payment',
      {
        countryCode: 'US',
        currencyCode: 'USD',
        totalPriceStatus: 'NOT_CURRENTLY_KNOWN',
      },
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
      <Grid>
        <CircleProgress mini />
      </Grid>
    );
  }

  return (
    <Grid>
      <button
        className={cx({
          [classes.button]: true,
          [classes.disabled]: disabledDueToProcessing,
        })}
        data-qa-button="gpayChip"
        disabled={disabledDueToProcessing}
        onClick={handlePay}
      >
        <GooglePayIcon height="26" width="49" />
      </button>
    </Grid>
  );
};

export default GooglePayChip;
