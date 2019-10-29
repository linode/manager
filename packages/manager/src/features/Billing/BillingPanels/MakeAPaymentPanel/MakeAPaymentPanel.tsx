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

import * as classNames from 'classnames';
import {
  executePaypalPayment,
  makePayment,
  stagePaypalPayment
} from 'linode-js-sdk/lib/account';
import { APIError } from 'linode-js-sdk/lib/types';
import { pathOr } from 'ramda';
import * as React from 'react';
import scriptLoader from 'react-async-script-loader';
import * as ReactDOM from 'react-dom';
import { compose } from 'recompose';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import FormControlLabel from 'src/components/core/FormControlLabel';
import RadioGroup from 'src/components/core/RadioGroup';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Tooltip from 'src/components/core/Tooltip';
import ErrorState from 'src/components/ErrorState';
import ExpansionPanel from 'src/components/ExpansionPanel';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import Radio from 'src/components/Radio';
import TextField from 'src/components/TextField';
import { paypalClientEnv } from 'src/constants';
import AccountContainer, {
  DispatchProps as AccountDispatchProps
} from 'src/containers/account.container';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';

import { reportException } from 'src/exceptionReporting';

import CreditCardDialog from './PaymentBits/CreditCardDialog';
import PaypalDialog from './PaymentBits/PaypalDialog';

type ClassNames =
  | 'root'
  | 'positive'
  | 'negative'
  | 'actionPanel'
  | 'paypalMask'
  | 'paypalButtonWrapper'
  | 'PaypalHidden';

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
    paypalMask: {
      width: 175,
      height: 45,
      position: 'absolute',
      zIndex: 10,
      left: theme.spacing(2),
      top: theme.spacing(2)
    },
    paypalButtonWrapper: {
      position: 'relative',
      zIndex: 1,
      transition: theme.transitions.create(['opacity'])
    },
    PaypalHidden: {
      opacity: 0.3
    }
  });

interface State {
  type: 'CREDIT_CARD' | 'PAYPAL';
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
}

type CombinedProps = AccountContextProps &
  PaypalScript &
  AccountDispatchProps &
  WithStyles<ClassNames>;

type PaypalButton = React.ComponentType<Paypal.PayButtonProps>;

/* tslint:disable-next-line */
let PaypalButton: PaypalButton; // needs to be a JSX.Element with some props

/*
 * Client Script src for Linode Paypal Apps
 */
const client = {
  sandbox: 'sb',
  // 'YbjxBCou-0Aum1f2K1xqSgrJqhNCHOEbdmvi1pPQhk-bj_dLrJ41Cssm_ektzlNxZJc9A-dx6UkYu2n',
  production:
    'AWdnFJ_Yx5X9uqKZQdbdkLfCnEJwtauQJ2tyesKf3S0IxSrkRLmB2ZN2ACSwy37gxY_AZoTagHWlZCOA'
};

const paypalSrcQueryParams = `&disable-funding=card,credit&currency=USD&commit=false&intent=capture`;

const paypalScriptSrc = () => {
  return `https://www.paypal.com/sdk/js?client-id=${
    client[env]
  }${paypalSrcQueryParams}`;
};

export const getDefaultPayment = (balance: number | false): string => {
  if (!balance) {
    return '';
  }
  // $5 is the minimum payment amount, so we don't want to set a default if they owe less than that.
  return balance > 5 ? String(balance.toFixed(2)) : '';
};

class MakeAPaymentPanel extends React.Component<CombinedProps, State> {
  state: State = {
    type: 'CREDIT_CARD',
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

  componentDidUpdate(prevProps: CombinedProps, prevState: State) {
    if (!prevProps.isScriptLoadSucceed && this.props.isScriptLoadSucceed) {
      /*
       * Because the paypal script is now loaded, so now we have access to this React component
       * in the window element. This will be used in the render method.
       * See documentation here:
       * https://github.com/paypal/paypal-checkout-components/blob/master/demo/react.htm
       */
      PaypalButton = (window as any).paypal.Buttons.driver('react', {
        React,
        ReactDOM
      });
      this.setState({ paypalLoaded: true });
    }

    if (prevProps.accountLoading && !this.props.accountLoading) {
      const defaultPayment = getDefaultPayment(this.props.balance);
      this.setState({
        usd: defaultPayment,
        paypalSubmitEnabled: Number(defaultPayment) >= 5
      });
    }
  }

  handleTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      successMessage: '',
      type: e.target.value as 'CREDIT_CARD' | 'PAYPAL',
      paypalSubmitEnabled: shouldEnablePaypalButton(
        parseInt(this.state.usd, 10)
      )
    });
  };

  handleUSDChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    /*
     * This is a little hacky. Papyal doesn't give us any reliable way to
     * validate the form before opening up paypal.com in a new tab, so we have
     * to do this validation on each keypress and disable the submit button if
     * the criteria isn't met
     * Luckily, the only thing the API validates is if the amount is over $5 USD
     */

    const amountAsInt = parseInt(e.target.value, 10);

    if (this.state.type === 'PAYPAL') {
      this.setState({
        paypalSubmitEnabled: shouldEnablePaypalButton(amountAsInt)
      });
    }

    this.setState({ usd: e.target.value || '' });
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
      .then(response => {
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
          successMessage: `Payment for $${
            this.state.usd
          } successfully submitted`
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
   * @param actions - handers to do more things. Optional argument that we
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
   * It is also impertive that this function returns the checkout_id returned from APIv4.
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
        return;
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
      <ExpansionPanel heading="Make a Payment">
        <Grid container>
          <ErrorState errorText="You are not authorized to view billing information" />
        </Grid>
      </ExpansionPanel>
    );
  };

  renderForm = () => {
    const { lastFour } = this.props;
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
        <ExpansionPanel heading="Make a Payment" actions={this.renderActions}>
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
              <RadioGroup
                aria-label="payment type"
                name="type"
                value={this.state.type}
                onChange={this.handleTypeChange}
                row
              >
                <FormControlLabel
                  value="CREDIT_CARD"
                  label={`Credit Card ${lastFour}`}
                  control={<Radio />}
                />
                {!!PaypalButton && this.state.paypalLoaded && (
                  <FormControlLabel
                    value="PAYPAL"
                    label="Paypal"
                    control={<Radio />}
                  />
                )}
              </RadioGroup>
              <TextField
                errorText={hasErrorFor('usd')}
                label="Amount to Charge"
                onChange={this.handleUSDChange}
                value={this.state.usd}
                required
                type="number"
                placeholder={`5.00 minimum`}
              />
              {this.state.type === 'CREDIT_CARD' && (
                <TextField
                  errorText={hasErrorFor('cvv')}
                  label="CVV"
                  onChange={this.handleCVVChange}
                  value={this.state.cvv}
                  type="text"
                  placeholder={`000`}
                />
              )}
            </Grid>
          </Grid>
        </ExpansionPanel>
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

  renderActions = () => {
    const { classes } = this.props;
    const { paypalSubmitEnabled } = this.state;
    return (
      <ActionsPanel className={classes.actionPanel}>
        {this.state.type === 'PAYPAL' ? (
          <React.Fragment>
            {!paypalSubmitEnabled && (
              <Tooltip
                title={'Amount to charge must be between $5 and $500'}
                data-qa-help-tooltip
                enterTouchDelay={0}
                leaveTouchDelay={5000}
              >
                <div className={classes.paypalMask} />
              </Tooltip>
            )}

            <div
              data-qa-paypal-button
              className={classNames({
                [classes.paypalButtonWrapper]: true,
                [classes.PaypalHidden]: !paypalSubmitEnabled
              })}
            >
              <PaypalButton
                env={env}
                client={client}
                createOrder={this.createOrder}
                onApprove={this.onApprove}
                onCancel={this.onCancel}
                style={{
                  color: 'blue',
                  shape: 'rect'
                }}
              />
            </div>
          </React.Fragment>
        ) : (
          <Button buttonType="primary" onClick={this.openCreditCardDialog}>
            Submit Payment
          </Button>
        )}
        <Button buttonType="cancel" onClick={this.resetForm}>
          Cancel
        </Button>
      </ActionsPanel>
    );
  };
}

const styled = withStyles(styles);

const withAccount = AccountContainer(
  (ownProps, accountLoading, accountData) => ({
    ...ownProps,
    accountLoading,
    balance: pathOr(false, ['balance'], accountData),
    lastFour: pathOr('', ['credit_card', 'last_four'], accountData)
  })
);

export default compose<CombinedProps, {}>(
  styled,
  withAccount,
  scriptLoader(paypalScriptSrc())
)(MakeAPaymentPanel);

export const isAllowedUSDAmount = (usd: number) => {
  return !!(usd >= 5 && usd <= 500);
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
