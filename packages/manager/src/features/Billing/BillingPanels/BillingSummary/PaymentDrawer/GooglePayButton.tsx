import * as React from 'react';
import classNames from 'classnames';
import { VariantType } from 'notistack';
import { makeStyles, Theme } from 'src/components/core/styles';
import { useScript } from 'src/hooks/useScript';
import { useClientToken } from 'src/queries/accountPayment';
import { queryClient } from 'src/queries/base';
import { queryKey } from 'src/queries/accountBilling';
import { SetSuccess } from './types';
import {
  initGooglePaymentInstance,
  gPay,
} from 'src/features/Billing/Providers/GooglePay';
import GooglePayIcon from 'src/assets/icons/payment/gPayButton.svg';
import Notice from 'src/components/Notice';
import Button from 'src/components/Button';
import Tooltip from 'src/components/core/Tooltip';

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
}

export const GooglePayButton: React.FC<Props> = (props) => {
  const status = useScript('https://pay.google.com/gp/p/js/pay.js');
  const { data, error } = useClientToken();
  const classes = useStyles();

  const { transactionInfo, balance, setSuccess, setError } = props;

  /**
   * We're following API's validation logic:
   *
   * GPay min is $5, max of $2000.
   * If the customer has a balance over $2000, then the max is $50000
   */
  const disabled =
    +transactionInfo.totalPrice < 5 ||
    (+transactionInfo.totalPrice > 2000 && balance < 2000) ||
    +transactionInfo.totalPrice > 50000;

  React.useEffect(() => {
    if (status === 'ready' && data) {
      initGooglePaymentInstance(data.client_token as string);
    }
  }, [status, data]);

  const handlePay = () => {
    gPay(
      'one-time-payment',
      transactionInfo,
      (message: string, variant: VariantType) => {
        if (variant === 'error') {
          setError(message);
        } else if (variant === 'success') {
          setSuccess(message, true);
          queryClient.invalidateQueries(`${queryKey}-payments`);
        }
      }
    );
  };

  if (status === 'error' || error) {
    return <Notice error text="There was an error loading Google Pay." />;
  }

  return (
    <div className={classes.root}>
      {disabled && (
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
      <Button
        className={classNames({
          [classes.button]: true,
          [classes.disabled]: disabled,
        })}
        disabled={disabled}
        onClick={handlePay}
      >
        <GooglePayIcon />
      </Button>
    </div>
  );
};

export default GooglePayButton;
