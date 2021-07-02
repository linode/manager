import * as classnames from 'classnames';
import { APIWarning } from '@linode/api-v4/lib/types';
import * as React from 'react';
import makeAsyncScriptLoader from 'react-async-script';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Currency from 'src/components/Currency';
import Drawer from 'src/components/Drawer';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import SupportLink from 'src/components/SupportLink';
import TextField from 'src/components/TextField';
import { v4 } from 'uuid';
import CreditCard from './CreditCardPayment';
import PayPal, { paypalScriptSrc } from './Paypal';
import { SetSuccess } from './types';
import { useAccount } from 'src/queries/account';

const useStyles = makeStyles((theme: Theme) => ({
  root: {},
  currentBalance: {
    fontSize: '1.1rem',
    marginBottom: theme.spacing(4),
  },
  credit: {
    color: '#02b159',
  },
}));

interface Props {
  open: boolean;
  onClose: () => void;
}

export const getMinimumPayment = (balance: number | false) => {
  if (!balance || balance <= 0) {
    return '5.00';
  }
  /**
   * We follow the API's validation logic:
   *
   * If balance > 5 then min payment is $5
   * If balance < 5 but > 0, min payment is their balance
   * If balance < 0 then min payment is $5
   */
  return Math.min(5, balance).toFixed(2);
};

const AsyncPaypal = makeAsyncScriptLoader(paypalScriptSrc())(PayPal);

export const PaymentDrawer: React.FC<Props> = (props) => {
  const { open, onClose } = props;
  const { data: account, isLoading: accountLoading, refetch } = useAccount();
  const classes = useStyles();

  const [usd, setUSD] = React.useState<string>(
    getMinimumPayment(account?.balance || 0)
  );
  const [successMessage, setSuccessMessage] = React.useState<string | null>(
    null
  );
  const [warning, setWarning] = React.useState<APIWarning | null>(null);

  const [creditCardKey, setCreditCardKey] = React.useState<string>(v4());
  const [payPalKey, setPayPalKey] = React.useState<string>(v4());
  const [
    isPaypalScriptLoaded,
    setIsPaypalScriptLoaded,
  ] = React.useState<boolean>(false);

  React.useEffect(() => {
    setUSD(getMinimumPayment(account?.balance || 0));
  }, [account]);

  React.useEffect(() => {
    if (open) {
      setSuccessMessage(null);
      setWarning(null);
    }
  }, [open]);

  const handleUSDChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUSD(e.target.value || '');
  };

  const setSuccess: SetSuccess = (
    message,
    paymentWasMade = false,
    warnings = undefined
  ) => {
    setSuccessMessage(message);
    if (paymentWasMade) {
      // Reset everything
      setUSD('0.00');
      setCreditCardKey(v4());
      setPayPalKey(v4());
      refetch();
    }
    if (warnings && warnings.length > 0) {
      setWarning(warnings[0]);
    }
  };

  const minimumPayment = getMinimumPayment(account?.balance || 0);

  if (!accountLoading && account?.balance === undefined) {
    return (
      <Grid container>
        <ErrorState errorText="You are not authorized to view billing information" />
      </Grid>
    );
  }

  const onScriptLoad = () => {
    setIsPaypalScriptLoaded(true);
  };

  return (
    <Drawer title="Make a Payment" open={open} onClose={onClose}>
      <Grid container>
        <Grid item xs={12}>
          {successMessage && <Notice success text={successMessage ?? ''} />}
          {warning ? <Warning warning={warning} /> : null}
          {account ? (
            <Grid item>
              <Typography variant="h3" className={classes.currentBalance}>
                <strong>
                  Current balance:{' '}
                  <span
                    className={classnames({
                      [classes.credit]: account?.balance < 0,
                    })}
                  >
                    <Currency quantity={Math.abs(account?.balance || 0)} />
                    {account?.balance < 0 ? ' Credit' : ''}
                  </span>
                </strong>
              </Typography>
            </Grid>
          ) : null}
          <Grid item>
            <TextField
              label="Payment Amount"
              onChange={handleUSDChange}
              value={usd}
              required
              type="number"
              placeholder={`${minimumPayment} minimum`}
            />
          </Grid>

          <CreditCard
            key={creditCardKey}
            lastFour={account?.credit_card.last_four || ''}
            expiry={account?.credit_card.expiry || ''}
            usd={usd}
            minimumPayment={minimumPayment}
            setSuccess={setSuccess}
          />

          <AsyncPaypal
            key={payPalKey}
            usd={usd}
            setSuccess={setSuccess}
            asyncScriptOnLoad={onScriptLoad}
            isScriptLoaded={isPaypalScriptLoaded}
          />
        </Grid>
      </Grid>
    </Drawer>
  );
};

interface WarningProps {
  warning: APIWarning;
}

const Warning: React.FC<WarningProps> = (props) => {
  const { warning } = props;
  /** The most common API warning includes "please open a Support ticket",
   * which we'd like to be a link.
   */
  const ticketLink = warning.detail.match(/open a support ticket\./i) ? (
    <>
      {warning.detail.replace(/open a support ticket\./i, '')}
      <SupportLink
        text="open a Support ticket"
        title={`Re: ${warning.detail}`}
      />
      .
    </>
  ) : (
    warning.detail
  );
  const message = (
    <>
      {warning.title} {ticketLink}
    </>
  );
  return <Notice warning>{message}</Notice>;
};

export default PaymentDrawer;
