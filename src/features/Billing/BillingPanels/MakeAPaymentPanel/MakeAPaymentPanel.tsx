import * as classNames from 'classnames';
import { pathOr } from 'ramda';
import * as React from 'react';
import scriptLoader from 'react-async-script-loader';
import * as ReactDOM from 'react-dom';
import { compose } from 'recompose';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import FormControlLabel from 'src/components/core/FormControlLabel';
import RadioGroup from 'src/components/core/RadioGroup';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Tooltip from 'src/components/core/Tooltip';
import Typography from 'src/components/core/Typography';
import Currency from 'src/components/Currency';
import ErrorState from 'src/components/ErrorState';
import ExpansionPanel from 'src/components/ExpansionPanel';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import Radio from 'src/components/Radio';
import TextField from 'src/components/TextField';
import AccountContainer, {
  DispatchProps as AccountDispatchProps
} from 'src/containers/account.container';
import {
  executePaypalPayment,
  makePayment,
  stagePaypalPayment
} from 'src/services/account';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';

type ClassNames =
  | 'root'
  | 'positive'
  | 'negative'
  | 'actionPanel'
  | 'paypalMask'
  | 'paypalButtonWrapper'
  | 'PaypalHidden';

const styles: StyleRulesCallback<ClassNames> = theme => ({
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
    left: theme.spacing.unit * 2,
    top: theme.spacing.unit * 2
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
  submitting: boolean;
  success?: boolean;
  successMessage?: string;
  errors?: Linode.ApiFieldError[];
  usd: string;
  cvv?: string;
  paymentID: string;
  payerID: string;
  isExecutingPaypalPayment: boolean;
  paypalSubmitEnabled: boolean;
  dialogOpen: boolean;
  paypalLoaded: boolean;
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
 * Client IDs for Linode Paypal Apps
 */
const client = {
  sandbox:
    'YbjxBCou-0Aum1f2K1xqSgrJqhNCHOEbdmvi1pPQhk-bj_dLrJ41Cssm_ektzlNxZJc9A-dx6UkYu2n',
  production:
    'AWdnFJ_Yx5X9uqKZQdbdkLfCnEJwtauQJ2tyesKf3S0IxSrkRLmB2ZN2ACSwy37gxY_AZoTagHWlZCOA'
};

const env = process.env.NODE_ENV === 'development' ? 'sandbox' : 'production';

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
    submitting: false,
    usd: getDefaultPayment(this.props.balance),
    cvv: '',
    dialogOpen: false,
    paymentID: '',
    payerID: '',
    isExecutingPaypalPayment: false,
    paypalLoaded: false,
    paypalSubmitEnabled: false // disabled until a user enters in an amount over $5 USD
  };

  componentDidUpdate(prevProps: CombinedProps) {
    if (!prevProps.isScriptLoadSucceed && this.props.isScriptLoadSucceed) {
      /*
       * Because the paypal script is now loaded, so now we have access to this React component
       * in the window element. This will be used in the render method.
       * See documentation: https://github.com/paypal/paypal-checkout/blob/master/docs/frameworks.md
       */
      PaypalButton = (window as any).paypal.Button.driver('react', {
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
      success: false,
      successMessage: '',
      type: e.target.value as 'CREDIT_CARD' | 'PAYPAL'
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

  handleCVVChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    this.setState({ cvv: e.target.value || '' });

  submitForm = () => {
    const { usd, cvv } = this.state;

    this.setState({
      submitting: true,
      errors: undefined,
      successMessage: ''
    });

    makePayment({
      usd: (+usd).toFixed(2),
      cvv
    })
      .then(response => {
        this.setState({
          submitting: false,
          success: true
        });
        this.props.requestAccount();
      })
      .catch(errorResponse => {
        this.setState({
          submitting: false,
          errors: getAPIErrorOrDefault(
            errorResponse,
            'Unable to make a payment at this time.'
          )
        });
      });
  };

  resetForm = () =>
    this.setState({
      errors: undefined,
      success: undefined,
      usd: '',
      cvv: '',
      paypalSubmitEnabled: false
    });

  closeDialog = () => {
    this.setState({
      errors: undefined,
      dialogOpen: false,
      success: true,
      successMessage: 'Payment Cancelled'
    });
  };

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
          dialogOpen: false,
          success: true,
          usd: '',
          successMessage: ''
        });
      })
      .catch(errorResponse => {
        this.setState({
          isExecutingPaypalPayment: false,
          dialogOpen: false,
          usd: '',
          errors: getAPIErrorOrDefault(
            errorResponse,
            'Unable to make a payment at this time.'
          )
        });
      });
  };

  dialogActions = () => {
    return (
      <ActionsPanel>
        <Button type="cancel" onClick={this.closeDialog} data-qa-cancel>
          Cancel
        </Button>
        <Button
          type="secondary"
          loading={this.state.isExecutingPaypalPayment}
          onClick={this.confirmPaypalPayment}
          data-qa-submit
        >
          Confirm Payment
        </Button>
      </ActionsPanel>
    );
  };

  /*
   * This point of this function is to pass the payment_id,
   * which is returned from /account/payments/paypal
   * and then pass is to the Paypal login button
   *
   * Linode's API is handling all the logic of staging the Paypal payment
   * so that we don't have to create any sale client-side
   *
   * See documentation:
   * https://github.com/paypal/paypal-checkout/blob/master/docs/button.md#advanced-integration
   */
  payment = (data: any, actions: any) => {
    const { usd } = this.state;

    this.setState({
      submitting: true,
      errors: undefined
    });

    return stagePaypalPayment({
      cancel_url: 'https://cloud.linode.com/billing',
      redirect_url: 'https://cloud.linode.com/billing',
      usd: (+usd).toFixed(2)
    })
      .then((response: any) => {
        this.setState({
          submitting: false,
          paymentID: response.payment_id
        });
        return response.payment_id;
      })
      .catch(errorResponse => {
        this.setState({
          submitting: false,
          errors: getAPIErrorOrDefault(
            errorResponse,
            'Unable to make a payment at this time.'
          )
        });
        return;
      });
  };

  /**
   * Once the user authorizes the payment on Paypal's website
   * @param data - information that Paypal returns to then send to
   * /account/payment/paypal/execute
   * @param actions - handers to do more things. Optional argument that we
   * don't really need
   *
   * See documentation:
   * https://github.com/paypal/paypal-checkout/blob/master/docs/button.md#advanced-integration
   */
  onAuthorize = (data: Paypal.AuthData) => {
    this.setState({
      dialogOpen: true,
      payerID: data.payerID
    });
  };

  /*
   * User was navigated to Paypal's site and then cancelled the payment
   *
   * See documentation:
   * https://github.com/paypal/paypal-checkout/blob/master/docs/button.md#advanced-integration
   */
  onCancel = () => {
    this.setState({
      success: true,
      successMessage: 'Payment Cancelled'
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
    const { accountLoading, balance, lastFour, classes } = this.props;
    const { errors, success } = this.state;

    const hasErrorFor = getAPIErrorFor(
      {
        usd: 'amount',
        cvv: 'cvv'
      },
      errors
    );

    const type = this.state.type === 'PAYPAL' ? 'PayPal' : 'Credit Card';

    const generalError = hasErrorFor('none');
    const shouldDisplayBalance = !accountLoading && balance !== false;
    return (
      <React.Fragment>
        <ExpansionPanel heading="Make a Payment" actions={this.renderActions}>
          <Grid container>
            {/* Current Balance */}
            <Grid item xs={12}>
              <Grid container>
                <Grid item>
                  <Typography role="header" component={'span'} variant="h2">
                    Current Balance:
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography
                    component={'span'}
                    variant="h2"
                    className={classNames({
                      [classes.negative]: balance > 0,
                      [classes.positive]: balance <= 0
                    })}
                  >
                    {shouldDisplayBalance && (
                      <Currency quantity={Math.abs(balance as number)} />
                    )}
                    {balance < 0 && ` (credit)`}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>

            {/* Payment */}
            <Grid item xs={12}>
              {generalError && <Notice error text={generalError} />}
              {success && (
                <Notice
                  success
                  text={
                    this.state.successMessage
                      ? this.state.successMessage
                      : `Payment successfully submitted.`
                  }
                />
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
        <ConfirmationDialog
          open={this.state.dialogOpen}
          title={`Confirm Payment`}
          onClose={this.closeDialog}
          actions={this.dialogActions}
        >
          <Typography>
            {`Confirm ${type} payment for $${(+this.state.usd).toFixed(2)} USD
            to Linode LLC?`}
          </Typography>
        </ConfirmationDialog>
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
                payment={this.payment}
                onAuthorize={this.onAuthorize}
                client={client}
                commit={false}
                onCancel={this.onCancel}
                style={{
                  color: 'blue',
                  shape: 'rect'
                }}
              />
            </div>
          </React.Fragment>
        ) : (
          <Button
            type="primary"
            loading={this.state.submitting}
            onClick={this.submitForm}
          >
            Confirm Payment
          </Button>
        )}
        <Button type="cancel" onClick={this.resetForm}>
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
  scriptLoader('https://www.paypalobjects.com/api/checkout.js')
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
