import * as React from 'react';
import { compose } from 'recompose';
import { makeStyles, Theme } from 'src/components/core/styles';

import Drawer from 'src/components/Drawer';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';
import AccountContainer, {
  DispatchProps as AccountDispatchProps
} from 'src/containers/account.container';

import CreditCard from './CreditCard';
import PayPal from './Paypal';

const useStyles = makeStyles((theme: Theme) => ({
  root: {},
  positive: {
    color: theme.color.green
  },
  negative: {
    color: theme.color.red
  },
  actionPanel: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    position: 'relative'
  }
}));

interface AccountContextProps {
  accountLoading: boolean;
  balance: false | number;
  lastFour: string;
  expiry: string;
}

type CombinedProps = AccountContextProps & AccountDispatchProps;

export const getMinimumPayment = (balance: number | false) => {
  if (!balance) {
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

export const MakeAPaymentPanel: React.FC<CombinedProps> = props => {
  const { accountLoading, balance, expiry, lastFour } = props;
  const classes = useStyles();

  const [usd, setUSD] = React.useState<string>(getMinimumPayment(balance));
  const [successMessage, setSuccessMessage] = React.useState<string | null>(
    null
  );

  React.useEffect(() => {
    setUSD(getMinimumPayment(balance));
  }, [balance]);

  const handleUSDChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUSD(e.target.value || '');
  };

  const setSuccess = (
    message: string | null,
    paymentWasMade: boolean = true
  ) => {
    setSuccessMessage(message);
    if (paymentWasMade) {
      setUSD('0.00');
      props.requestAccount();
    }
  };

  // const hasErrorFor = getAPIErrorFor(
  //   {
  //     usd: 'amount',
  //     cvv: 'cvv',
  //     payment_id: 'payment_id'
  //   },
  //   errors
  // );

  // const generalError = hasErrorFor('none');
  if (!accountLoading && balance === undefined) {
    return (
      <Grid container>
        <ErrorState errorText="You are not authorized to view billing information" />
      </Grid>
    );
  }
  return (
    <Drawer title="Make a Payment" open={true}>
      <Grid container>
        {/* Payment */}
        <Grid item xs={12}>
          {/* {(generalError || hasErrorFor('payment_id')) && (
              <Notice error text={generalError || hasErrorFor('payment_id')} />
            )} */}
          {successMessage && <Notice success text={successMessage ?? ''} />}

          <Grid item>
            <TextField
              // errorText={hasErrorFor('usd')}
              label="Payment Amount"
              onChange={handleUSDChange}
              value={usd}
              required
              type="number"
              placeholder={`${getMinimumPayment(balance || 0)} minimum`}
            />
          </Grid>

          <CreditCard
            lastFour={lastFour}
            expiry={expiry}
            usd={usd}
            setSuccess={setSuccess}
          />

          <PayPal usd={usd} setSuccess={setSuccess} />
        </Grid>
      </Grid>
    </Drawer>
  );
};

const withAccount = AccountContainer(
  (ownProps, { accountLoading, accountData }) => ({
    accountLoading,
    balance: accountData?.balance ?? 0,
    lastFour: accountData?.credit_card.last_four ?? '0000',
    expiry: accountData?.credit_card.expiry ?? ''
  })
);

export default compose<CombinedProps, {}>(withAccount)(MakeAPaymentPanel);
