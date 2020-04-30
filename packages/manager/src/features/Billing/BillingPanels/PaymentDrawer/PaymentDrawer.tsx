import * as React from 'react';
import { compose } from 'recompose';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Currency from 'src/components/Currency';
import Drawer from 'src/components/Drawer';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';
import AccountContainer, {
  DispatchProps as AccountDispatchProps
} from 'src/containers/account.container';
import { v4 } from 'uuid';

import CreditCard from './CreditCard';
import PayPal from './Paypal';

const useStyles = makeStyles((theme: Theme) => ({
  root: {},
  currentBalance: {
    fontSize: '1.1rem',
    marginBottom: theme.spacing(4)
  }
}));

interface Props {
  open: boolean;
  onClose: () => void;
}

interface AccountContextProps {
  accountLoading: boolean;
  balance: false | number;
  lastFour: string;
  expiry: string;
}

type CombinedProps = Props & AccountContextProps & AccountDispatchProps;

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

export const PaymentDrawer: React.FC<CombinedProps> = props => {
  const { accountLoading, balance, expiry, lastFour, open, onClose } = props;
  const classes = useStyles();

  const [usd, setUSD] = React.useState<string>(getMinimumPayment(balance));
  const [successMessage, setSuccessMessage] = React.useState<string | null>(
    null
  );

  const [creditCardKey, setCreditCardKey] = React.useState<string>(v4());
  const [payPalKey, setPayPalKey] = React.useState<string>(v4());

  React.useEffect(() => {
    setUSD(getMinimumPayment(balance));
  }, [balance]);

  React.useEffect(() => {
    if (open) {
      setSuccessMessage(null);
    }
  }, [open]);

  const handleUSDChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUSD(e.target.value || '');
  };

  const setSuccess = (
    message: string | null,
    paymentWasMade: boolean = false
  ) => {
    setSuccessMessage(message);
    if (paymentWasMade) {
      // Reset everything
      setUSD('0.00');
      setCreditCardKey(v4());
      setPayPalKey(v4());
      props.requestAccount();
    }
  };

  if (!accountLoading && balance === undefined) {
    return (
      <Grid container>
        <ErrorState errorText="You are not authorized to view billing information" />
      </Grid>
    );
  }

  return (
    <Drawer title="Make a Payment" open={open} onClose={onClose}>
      <Grid container>
        <Grid item xs={12}>
          {successMessage && <Notice success text={successMessage ?? ''} />}
          {balance !== false && (
            <Grid item>
              <Typography variant="h3" className={classes.currentBalance}>
                <strong>
                  Current balance:{' '}
                  <Currency
                    quantity={balance}
                    wrapInParentheses={balance < 0}
                  />
                </strong>
              </Typography>
            </Grid>
          )}
          <Grid item>
            <TextField
              label="Payment Amount"
              onChange={handleUSDChange}
              value={usd}
              required
              type="number"
              placeholder={`${getMinimumPayment(balance || 0)} minimum`}
            />
          </Grid>

          <CreditCard
            key={creditCardKey}
            lastFour={lastFour}
            expiry={expiry}
            usd={usd}
            setSuccess={setSuccess}
          />

          <PayPal key={payPalKey} usd={usd} setSuccess={setSuccess} />
        </Grid>
      </Grid>
    </Drawer>
  );
};

const withAccount = AccountContainer(
  (ownProps, { accountLoading, accountData }) => ({
    accountLoading,
    balance: accountData?.balance ?? false,
    lastFour: accountData?.credit_card.last_four ?? '0000',
    expiry: accountData?.credit_card.expiry ?? ''
  })
);

export default compose<CombinedProps, Props>(withAccount)(PaymentDrawer);
