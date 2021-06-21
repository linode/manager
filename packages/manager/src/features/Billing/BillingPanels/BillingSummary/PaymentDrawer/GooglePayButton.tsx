import * as React from 'react';
import classNames from 'classnames';
import { makeStyles, Theme } from 'src/components/core/styles';
import { ScriptStatus, useScript } from 'src/hooks/useScript';
import { SetSuccess } from './types';
import {
  initGooglePaymentInstance,
  makePayment,
} from 'src/features/Billing/Providers/GooglePay';
import GooglePayIcon from 'src/assets/icons/payment/gPayButton.svg';
import Grid from 'src/components/Grid';
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
    '&:hover': {
      opacity: 0.8,
      background: theme.cmrBGColors.bgGooglePay,
    },
    '& svg': {
      color: theme.cmrTextColors.textGooglePay,
      height: 16,
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
}

const GooglePay: React.FC<Props> = (props) => {
  const status = useScript('https://pay.google.com/gp/p/js/pay.js');
  const classes = useStyles();

  const { transactionInfo, balance, setSuccess } = props;

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
    if (status === ScriptStatus.READY) {
      initGooglePaymentInstance(process.env.REACT_APP_BT_TOKEN || '');
    }
  }, [status]);

  const handlePay = () => {
    makePayment(transactionInfo, (message: string, _) => setSuccess(message));
  };

  if (status === ScriptStatus.ERROR) {
    return (
      <Grid container direction="column">
        <Notice error text="There was an error loading Google Pay." />
      </Grid>
    );
  }

  return (
    <div className={classes.root}>
      {disabled && (
        <Tooltip
          title={`Amount to charge must be between $5 and ${
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

export default GooglePay;
