import * as React from 'react';
import { useEffect } from 'react';
import { ScriptStatus, useLazyScript } from 'src/hooks/useScript';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import Button from 'src/components/Button';
import { SetSuccess } from './types';
import { makeStyles, Theme } from 'src/components/core/styles';
import { makePayment } from 'src/features/Billing/Providers/GooglePay';
import GooglePayIcon from 'src/assets/icons/payment/googlePayButton.svg';
import classNames from 'classnames';

const useStyles = makeStyles((theme: Theme) => ({
  button: {
    border: 0,
    backgroundColor: 'transparent',
    marginTop: theme.spacing(),
    padding: 0,
  },
  svg: {
    borderRadius: 5,
  },
  disabled: {
    opacity: 0.3,
  },
}));

interface Props {
  usd?: string;
  transactionInfo: google.payments.api.TransactionInfo;
  setSuccess: SetSuccess;
}

const GooglePay: React.FC<Props> = (props) => {
  const { status, load } = useLazyScript(
    'https://pay.google.com/gp/p/js/pay.js'
  );
  const classes = useStyles();

  const { usd, transactionInfo, setSuccess } = props;
  const disabled = (usd && +usd < 5) || false;

  const handlePay = () => {
    makePayment(
      process.env.REACT_APP_BT_TOKEN || '',
      transactionInfo,
      (message: string, _) => setSuccess(message)
    );
  };

  useEffect(() => {
    if (status === ScriptStatus.READY) {
      handlePay();
    }
  }, [status]);

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
      onClick={status === ScriptStatus.READY ? handlePay : load}
    >
      <GooglePayIcon className={classes.svg} />
    </Button>
  );
};

export default GooglePay;
