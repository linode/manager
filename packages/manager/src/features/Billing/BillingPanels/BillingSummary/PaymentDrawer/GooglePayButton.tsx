import * as React from 'react';
import { ScriptStatus, useScript } from 'src/hooks/useScript';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import Button from 'src/components/Button';
import { SetSuccess } from './types';
import { makeStyles, Theme } from 'src/components/core/styles';
import {
  initGooglePaymentInstance,
  makePayment,
} from 'src/features/Billing/Providers/GooglePay';
import GooglePayIcon from 'src/assets/icons/payment/gPayButton.svg';
import classNames from 'classnames';

const useStyles = makeStyles((theme: Theme) => ({
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
}));

interface Props {
  transactionInfo: google.payments.api.TransactionInfo;
  setSuccess: SetSuccess;
}

const GooglePay: React.FC<Props> = (props) => {
  const status = useScript('https://pay.google.com/gp/p/js/pay.js');
  const classes = useStyles();

  const { transactionInfo, setSuccess } = props;
  const disabled = +transactionInfo.totalPrice < 5;

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
  );
};

export default GooglePay;
