/**
 * When viewing the PayPal code, please keep in mind the following flow
 *
 * 1. Make API call to v4/paypal to stage our paypal payment
 * 2. Return an order id in the createOrder callback
 * 3. Set payment_id state with the payment_id provided by Paypal
 * 4. Finally, POST to v4/paypal/execute
 *
 * These things must happen in this order or the paypal payment will not
 * process correctly. It is imperative that the APIv4 staging call happens before
 * the the createOrder callback is returned.
 *
 * For all documentation, see below:
 *
 * https://developer.paypal.com/docs/checkout/
 * https://developer.paypal.com/docs/checkout/integrate/
 *
 * We are **NOT** using the legacy PayPal version so please disregard any legacy
 * instructions
 *
 */
import { APIError } from 'linode-js-sdk/lib/types';
import * as React from 'react';
import { compose } from 'recompose';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';

import Drawer from 'src/components/Drawer';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';
import AccountContainer, {
  DispatchProps as AccountDispatchProps
} from 'src/containers/account.container';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';

import CreditCard from './CreditCard';
import PayPal from './Paypal';

type ClassNames =
  | 'root'
  | 'positive'
  | 'negative'
  | 'actionPanel'
  | 'paypalMask'
  | 'paypalButtonWrapper'
  | 'PaypalHidden'
  | 'cvvField';

const styles = (theme: Theme) =>
  createStyles({
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
  });

interface State {
  successMessage: string | null;
  errors?: APIError[];
  usd: string;
}

interface PaypalScript {
  isScriptLoadSucceed?: boolean;
  isScriptLoaded?: boolean;
  onScriptLoaded?: () => void;
}

interface AccountContextProps {
  accountLoading: boolean;
  balance: false | number;
  lastFour: string;
  expiry: string;
}

type CombinedProps = AccountContextProps &
  PaypalScript &
  AccountDispatchProps &
  WithStyles<ClassNames>;

export const getMinimumPayment = (balance: number | false) => {
  if (!balance) {
    return '5';
  }
  /**
   * For other payments, we follow the API's validation logic:
   *
   * If balance > 5 then min payment is $5
   * If balance < 5 but > 0, min payment is their balance
   * If balance < 0 then min payment is $5
   */
  return Math.min(5, balance).toFixed(2);
};

class MakeAPaymentPanel extends React.Component<CombinedProps, State> {
  state: State = {
    usd: getMinimumPayment(this.props.balance),
    successMessage: null
  };

  componentDidUpdate(prevProps: CombinedProps) {
    if (prevProps.accountLoading && !this.props.accountLoading) {
      const defaultPayment = getMinimumPayment(this.props.balance);
      this.setState({
        usd: defaultPayment
      });
    }
  }

  handleUSDChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    /*
     * This is a little hacky. Papyal doesn't give us any reliable way to
     * validate the form before opening up paypal.com in a new tab, so we have
     * to do this validation on each keypress and disable the submit button if
     * the criteria isn't met
     * Luckily, the only thing the API validates is if the amount is over $5 USD
     */

    const amountAsInt = parseInt(e.target.value, 10);

    this.setState({
      usd: e.target.value || ''
    });
  };

  setSuccess = (message: string | null) => {
    this.setState({ successMessage: message });
  };

  renderNotAuthorized = () => {
    return (
      <Grid container>
        <ErrorState errorText="You are not authorized to view billing information" />
      </Grid>
    );
  };

  renderForm = () => {
    const { balance, lastFour } = this.props;
    const { errors, successMessage } = this.state;

    const hasErrorFor = getAPIErrorFor(
      {
        usd: 'amount',
        cvv: 'cvv',
        payment_id: 'payment_id'
      },
      errors
    );

    const generalError = hasErrorFor('none');

    return (
      <Drawer title="Make a Payment" open={true}>
        <Grid container>
          {/* Payment */}
          <Grid item xs={12}>
            {(generalError || hasErrorFor('payment_id')) && (
              <Notice error text={generalError || hasErrorFor('payment_id')} />
            )}
            {successMessage && (
              <Notice success text={this.state.successMessage ?? ''} />
            )}

            <Grid item>
              <TextField
                errorText={hasErrorFor('usd')}
                label="Payment Amount"
                onChange={this.handleUSDChange}
                value={this.state.usd}
                required
                type="number"
                placeholder={`${getMinimumPayment(balance || 0)} minimum`}
              />
            </Grid>

            <CreditCard
              lastFour={lastFour}
              expiry={this.props.expiry}
              usd={this.state.usd}
              setSuccess={this.setSuccess}
            />

            <PayPal
              enabled={shouldEnablePaypalButton(parseInt(this.state.usd, 10))}
              usd={this.state.usd}
              setSuccess={this.setSuccess}
            />
          </Grid>
        </Grid>
      </Drawer>
    );
  };

  render() {
    const { accountLoading, balance } = this.props;
    return !accountLoading && balance === undefined
      ? this.renderNotAuthorized()
      : this.renderForm();
  }
}

const styled = withStyles(styles);

const withAccount = AccountContainer(
  (ownProps, { accountLoading, accountData }) => ({
    accountLoading,
    balance: accountData?.balance ?? 0,
    lastFour: accountData?.credit_card.last_four ?? '0000',
    expiry: accountData?.credit_card.expiry ?? ''
  })
);

export default compose<CombinedProps, {}>(
  styled,
  withAccount
)(MakeAPaymentPanel);

export const isAllowedUSDAmount = (usd: number) => {
  return !!(usd >= 5 && usd <= 10000);
};

export const shouldEnablePaypalButton = (value: number | undefined) => {
  /**
   * paypal button should be disabled if there is either
   * no value entered or it's below $5 or over $500 as per APIv4 requirements
   */

  if (!value || !isAllowedUSDAmount(value)) {
    return false;
  }
  return true;
};
