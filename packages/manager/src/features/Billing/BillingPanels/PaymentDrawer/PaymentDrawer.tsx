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

import {
  executePaypalPayment,
  makePayment,
  stagePaypalPayment
} from 'linode-js-sdk/lib/account';
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
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';

import { reportException } from 'src/exceptionReporting';

import CreditCard from './CreditCard';
import CreditCardDialog from './PaymentBits/CreditCardDialog';
import PayPal from './Paypal'
import PaypalDialog from './PaymentBits/PaypalDialog';

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
    },
    
  });

interface State {
  isSubmittingCreditCardPayment: boolean;
  successMessage?: string;
  errors?: APIError[];
  usd: string;
  cvv?: string;
  paymentID: string;
  payerID: string;
  isExecutingPaypalPayment: boolean;
  paypalSubmitEnabled: boolean;
  paypalDialogOpen: boolean;
  creditCardDialogOpen: boolean;
  paypalLoaded: boolean;
  isStagingPaypalPayment: boolean;
  paypalPaymentFailed: boolean;
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

export const getDefaultPayment = (balance: number | false): string => {
  if (!balance) {
    return '';
  }
  // $5 is the minimum payment amount, so we don't want to set a default if they owe less than that.
  return balance > 5 ? String(balance.toFixed(2)) : '';
};

export const getMinimumPayment = (balance: number, type: string) => {
  /**
   * Paypal payments have a minimum of $5 under all circumstances.
   * For other payments, we follow the API's validation logic:
   *
   * If balance > 5 then min payment is $5
   * If balance < 5 but > 0, min payment is their balance
   * If balance < 0 then min payment is $5
   */
  if (type === 'PAYPAL' || balance <= 0) {
    return 5;
  }
  return Math.min(5, balance);
};

class MakeAPaymentPanel extends React.Component<CombinedProps, State> {
  state: State = {
    isSubmittingCreditCardPayment: false,
    usd: getDefaultPayment(this.props.balance),
    cvv: '',
    paypalDialogOpen: false,
    creditCardDialogOpen: false,
    paymentID: '',
    payerID: '',
    isExecutingPaypalPayment: false,
    paypalLoaded: false,
    paypalSubmitEnabled: false, // disabled until a user enters in an amount over $5 USD
    isStagingPaypalPayment: false,
    paypalPaymentFailed: false
  };

  componentDidUpdate(prevProps: CombinedProps) {
    if (prevProps.accountLoading && !this.props.accountLoading) {
      const defaultPayment = getDefaultPayment(this.props.balance);
      this.setState({
        usd: defaultPayment,
        paypalSubmitEnabled: Number(defaultPayment) >= 5
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
      usd: e.target.value || '',
      paypalSubmitEnabled: shouldEnablePaypalButton(amountAsInt)
    });
  };

  handleCVVChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // All characters except numbers
    const regex = /(([\D]))/;

    // Prevents more than 4 characters from being submitted
    const cvv = e.target.value.slice(0, 4);
    this.setState({ cvv: cvv.replace(regex, '') });
  };

  confirmCardPayment = () => {
    const { usd, cvv } = this.state;

    this.setState({
      isSubmittingCreditCardPayment: true,
      errors: undefined,
      successMessage: ''
    });

    makePayment({
      usd: (+usd).toFixed(2),
      cvv
    })
      .then(_ => {
        this.setState({
          isSubmittingCreditCardPayment: false,
          successMessage: `Payment for $${usd} submitted successfully`,
          creditCardDialogOpen: false
        });
        this.props.requestAccount();
      })
      .catch(errorResponse => {
        this.setState({
          isSubmittingCreditCardPayment: false,
          creditCardDialogOpen: false,
          errors: getAPIErrorOrDefault(
            errorResponse,
            'Unable to make a payment at this time.'
          )
        });
      });
  };

  resetForm = () => {
    this.setState({
      errors: undefined,
      successMessage: '',
      usd: '',
      cvv: '',
      paypalSubmitEnabled: false
    });
  };

  closePaypalDialog = (wasCancelled: boolean) => {
    this.setState({
      paypalDialogOpen: false,
      successMessage: wasCancelled ? 'Payment Cancelled' : ''
    });
  };

  openCreditCardDialog = () => {
    this.setState({ creditCardDialogOpen: true });
  };

  closeCreditCardDialog = () => {
    this.setState({
      errors: undefined,
      creditCardDialogOpen: false
    });
  };

  /**
   * user submits payment and we send APIv4 request to confirm paypal payment
   */
  confirmPaypalPayment = () => {
    const { payerID, paymentID } = this.state;
    this.setState({ isExecutingPaypalPayment: true });
    executePaypalPayment({
      payer_id: payerID,
      payment_id: paymentID
    })
      .then(() => {
        this.setState({
          isExecutingPaypalPayment: false,
          paypalDialogOpen: false,
          successMessage: `Payment for $${this.state.usd} successfully submitted`
        });
      })
      .catch(errorResponse => {
        this.setState({
          isExecutingPaypalPayment: false,
          usd: '',
          paypalPaymentFailed: true
        });
      });
  };

  /**
   * Once the user authorizes the payment on Paypal's website. This functions
   * runs at the point when the user clicks "confirm" on paypal's website
   * and returns back to cloud manager
   *
   * @param data - information that Paypal returns to then send to
   * /account/payment/paypal/execute
   * @param actions - handlers to do more things. Optional argument that we
   * don't really need
   *
   * See documentation:
   * https://github.com/paypal/paypal-checkout-components/blob/master/docs/implement-checkout.md
   */
  onApprove = (data: Paypal.AuthData) => {
    this.setState({
      payerID: data.payerID
    });
  };

  /**
   * Callback function which serves the purpose of providing Paypal with
   * the order_id that we get from APIv4. It is imperative that this step happens before
   * we make the call to v4/execute.
   *
   * It is also imperative that this function returns the checkout_id returned from APIv4.
   * checkout_id is the same thing as order_id
   */
  createOrder = () => {
    const { usd } = this.state;

    this.setState({
      paypalDialogOpen: true,
      isStagingPaypalPayment: true,
      errors: undefined,
      paypalPaymentFailed: false,
      successMessage: ''
    });

    return stagePaypalPayment({
      cancel_url: 'https://www.paypal.com/checkoutnow/error',
      redirect_url: 'https://www.paypal.com/checkoutnow/error',
      usd: (+usd).toFixed(2)
    })
      .then(response => {
        this.setState({
          isStagingPaypalPayment: false,
          paymentID: response.payment_id
        });
        return response.checkout_token;
      })
      .catch(errorResponse => {
        /** For sentry purposes only */
        const cleanedError = getAPIErrorOrDefault(
          errorResponse,
          'Something went wrong with the call to Linode /v4/account/paypal. See tags for USD info'
        )[0].reason;

        /**
         * Send the error off to sentry with the USD amount in the tags
         */
        reportException(cleanedError, {
          'Raw USD': usd,
          'USD converted to number': (+usd).toFixed(2)
        });

        this.setState({
          isStagingPaypalPayment: false,
          paypalPaymentFailed: true
        });
      });
  };

  /*
   * User was navigated to Paypal's site and then cancelled the payment and came back
   * to cloud manager
   *
   * See documentation:
   * https://github.com/paypal/paypal-checkout-components/blob/master/docs/implement-checkout.md
   */
  onCancel = () => {
    this.setState({
      successMessage: 'Payment Cancelled',
      paypalDialogOpen: false
    });
  };

  renderNotAuthorized = () => {
    return (
      <Grid container>
        <ErrorState errorText="You are not authorized to view billing information" />
      </Grid>
    );
  };

  makeCreditCardPayment = (cvv: string) => {
    alert(`cvv: ${cvv}, balance: ${this.props.balance}`);
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
      <React.Fragment>
        <Drawer title="Make a Payment" open={true}>
          <Grid container>
            {/* Payment */}
            <Grid item xs={12}>
              {(generalError || hasErrorFor('payment_id')) && (
                <Notice
                  error
                  text={generalError || hasErrorFor('payment_id')}
                />
              )}
              {successMessage && (
                <Notice success text={this.state.successMessage} />
              )}

              <Grid item>
                <TextField
                  errorText={hasErrorFor('usd')}
                  label="Payment Amount"
                  onChange={this.handleUSDChange}
                  value={this.state.usd}
                  required
                  type="number"
                  placeholder={`${getMinimumPayment(
                    balance || 0,
                    'CREDIT_CARD'
                  ).toFixed(2)} minimum`}
                />
              </Grid>

              <CreditCard
                lastFour={lastFour}
                expiry={this.props.expiry}
                submitForm={this.makeCreditCardPayment}
              />

              <PayPal
                enabled={shouldEnablePaypalButton(parseInt(this.state.usd, 10))}
                onApprove={this.onApprove}
                onCancel={this.onCancel}
                createOrder={this.createOrder}
              />
            </Grid>
          </Grid>
        </Drawer>
        <PaypalDialog
          open={this.state.paypalDialogOpen}
          closeDialog={this.closePaypalDialog}
          isExecutingPayment={this.state.isExecutingPaypalPayment}
          isStagingPaypalPayment={this.state.isStagingPaypalPayment}
          initExecutePayment={this.confirmPaypalPayment}
          paypalPaymentFailed={this.state.paypalPaymentFailed}
          usd={(+this.state.usd).toFixed(2)}
        />
        <CreditCardDialog
          isMakingPayment={this.state.isSubmittingCreditCardPayment}
          cancel={this.closeCreditCardDialog}
          executePayment={this.confirmCardPayment}
          open={this.state.creditCardDialogOpen}
          usd={this.state.usd}
        />
      </React.Fragment>
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
