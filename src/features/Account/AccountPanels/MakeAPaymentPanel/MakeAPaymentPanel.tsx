import * as classNames from 'classnames';
import { compose, pathOr } from 'ramda';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import FormControlLabel from '@material-ui/core/FormControlLabel';
import RadioGroup from '@material-ui/core/RadioGroup';
import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ErrorState from 'src/components/ErrorState';
import ExpansionPanel from 'src/components/ExpansionPanel';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import Radio from 'src/components/Radio';
import TextField from 'src/components/TextField';
import { withAccount } from 'src/features/Account/context';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';

import { makePayment, stagePaypalPayment } from 'src/services/account';

import scriptLoader from 'react-async-script-loader';

type ClassNames = 'root' | 'positive' | 'negative';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme & Linode.Theme) => ({
  root: {},
  positive: {
    color: theme.color.green,
  },
  negative: {
    color: theme.color.red,
  },
});

interface Props { }

interface State {
  type: 'CREDIT_CARD' | 'PAYPAL',
  submitting: boolean;
  success?: boolean;
  errors?: Linode.ApiFieldError[];
  usd: string;
  ccv: string;
  showPaypal: boolean;
}

interface PaypalScript {
  isScriptLoadSucceed?: boolean;
  isScriptLoaded: boolean;
  onScriptLoaded?: () => void;
} 

interface AccountContextProps {
  accountLoading: boolean;
  balance: false | number,
}

type CombinedProps = Props
  & AccountContextProps
  & PaypalScript
  & WithStyles<ClassNames>;

/* tslint:disable-next-line */
let PaypalButton: any = undefined;

const client = {
  sandbox: 'AeDpsEcI7raAnq5JvcPJdUfuSDEfOXemPBOUKzc7s74xZMqP7J3CBKON2CLm0R1l7Cl4kH7FE56dJBMu',
  production: 'AeDpsEcI7raAnq5JvcPJdUfuSDEfOXemPBOUKzc7s74xZMqP7J3CBKON2CLm0R1l7Cl4kH7FE56dJBMu'
}

class MakeAPaymentPanel extends React.Component<CombinedProps, State> {
  state: State = {
    type: 'CREDIT_CARD',
    submitting: false,
    usd: '',
    ccv: '',
    showPaypal: false,
  };

  componentDidUpdate(prevProps: CombinedProps) {
    if (!this.state.showPaypal && this.props.isScriptLoadSucceed) {
      console.log('paypal script loaded!');
      /*
      * Becuase the paypal script is now loaded, we have access to the button component
      * in the window element. This will be used in the render method.
      * See documentation: https://github.com/paypal/paypal-checkout/blob/master/docs/frameworks.md
      */
      PaypalButton = (window as any).paypal.Button.driver('react', { React, ReactDOM });
      console.log((window as any).paypal)
      this.setState({ showPaypal: true });
    }
  }

  handleTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ type: e.target.value as 'CREDIT_CARD' | 'PAYPAL' });
  }

  handleUSDChange = (e: React.ChangeEvent<HTMLInputElement>) => this.setState({ usd: e.target.value || '' });

  handleCCVChange = (e: React.ChangeEvent<HTMLInputElement>) => this.setState({ ccv: e.target.value || '' });

  submitForm = () => {
    const { usd, ccv } = this.state;

    const errors = [];
    if (usd === '') {
      errors.push({ field: 'usd', reason: 'Amount cannot be blank.' });
    }

    if (ccv === '') {
      errors.push({ field: 'ccv', reason: 'CCV cannot be blank.' });
    }

    if (errors.length) {
      return this.setState({ errors });
    }

    this.setState({ submitting: true, errors: undefined });

    makePayment({
      usd: (+usd).toFixed(2),
      ccv,
    })
      .then((response) => {
        this.setState({
          submitting: false,
          success: true,
        })
      })
      .catch((error) => {
        this.setState({
          submitting: false,
          errors: pathOr([{ reason: 'Unable to make a payment at this time.' }], ['response', 'data', 'errors'], error),
        })
      })
  };

  resetForm = () => this.setState({
    errors: undefined,
    success: undefined,
    usd: '',
    ccv: '',
    type: 'CREDIT_CARD',
  });

  /*
  * This point of this function is to pass the payment_id,
  * which is returned from /account/payments/paypal
  * and then pass is to the Paypal login button
  * 
  * Linode's API is handling all the logic of staging the Paypal payment
  * so that we don't have to create any sale client-side
  */
  payment = () => {
    return stagePaypalPayment({
      cancel_url: 'http://localhost:3000/billing',
      redirect_url: 'http://localhost:3000/billing',
      usd: '5.00'
    })
      .then((data: any) => {
        console.log(data.payment_id);
        return data.payment_id;
      })
      .catch(() => {
        // try changing usd to bad value to warrant error
        // show some error here
        return;
      })
  }

  /**
   * Once the user authorizes the payment on Paypal's website
   * @param data - information that Paypal returns to then send to
   * /account/payment/paypal/execute
   * @param actions - handers to do more things. Optional argument that we
   * don't really need
   */
  onAuthorize = (data: Paypal.AuthData) => {
    console.log('user authorized payment');
    // need data.payerID
    console.log(data.payerID);
  }

  /*
  * User was navigated to Paypal's site and then cancelled the payment
  */
  onCancel = () => {
    console.log('paypal payment cancelled. aaaahhhhhhh');
  }

  renderNotAuthorized = () => {
    return (
      <ExpansionPanel heading="Make a Payment">
        <Grid container>
          <ErrorState
            errorText="You are not authorized to view billing information"
          />
        </Grid>
      </ExpansionPanel>
    )
  }

  renderForm = () => {
    const { accountLoading, balance, classes } = this.props;
    const { errors, success, showPaypal } = this.state;

    const hasErrorFor = getAPIErrorFor({
      usd: 'amount',
      ccv: 'ccv',
    }, errors);

    const generalError = hasErrorFor('none');
    const balanceDisplay = !accountLoading && balance !== false ? `$${Math.abs(balance).toFixed(2)}` : '';
    return (
      <ExpansionPanel defaultExpanded={true} heading="Make a Payment" actions={this.renderActions}>
        <Grid container>
          {/* Current Balance */}
          <Grid item xs={12}>
            <Grid container>
              <Grid item>
                <Typography role="header" component={'span'} variant="title">Current Balance:</Typography>
              </Grid>
              <Grid item>
                <Typography
                  component={'span'}
                  variant="title"
                  className={classNames({
                    [classes.negative]: balance > 0,
                    [classes.positive]: balance <= 0,
                  })}
                >
                  {balanceDisplay}
                  { balance < 0 && ` (credit)` }
                </Typography>
              </Grid>
            </Grid>
          </Grid>

          {/* Payment */}
          <Grid item xs={12}>
            {generalError && <Notice error text={generalError} />}
            {success && <Notice success text={`Payment successfully submitted.`} />}
            <RadioGroup
              aria-label="payment type"
              name="type"
              value={this.state.type}
              onChange={this.handleTypeChange}
              row
            >
              <FormControlLabel value="CREDIT_CARD" label="Credit Card" control={<Radio />} />
              {
                showPaypal && PaypalButton !== 'undefined' &&
                <React.Fragment>
                  <FormControlLabel value="PAYPAL" label="Paypal" control={<Radio />} />
                  <PaypalButton
                    payment={this.payment}
                    onAuthorize={this.onAuthorize}
                    client={client}
                    onCancel={this.onCancel}
                  />
                </React.Fragment>
              }
            </RadioGroup>
            <TextField
              errorText={hasErrorFor('usd')}
              label="Amount to Charge"
              onChange={this.handleUSDChange}
              value={this.state.usd}
              required
              type="number"
              placeholder={`1.00`}
            />
            {this.state.type === 'CREDIT_CARD' &&
              <TextField
                errorText={hasErrorFor('ccv')}
                label="CCV"
                onChange={this.handleCCVChange}
                value={this.state.ccv}
                required
                type="number"
                placeholder={`000`}
              />
            }
          </Grid>
        </Grid>
      </ExpansionPanel>
    );
  }

  render() {
    const { accountLoading, balance } = this.props;
    return (
      (!accountLoading && balance === undefined) ? this.renderNotAuthorized() : this.renderForm()
    );
  }

  renderActions = () => {
    return (
      <ActionsPanel>
        <Button
          type="primary"
          loading={this.state.submitting}
          onClick={this.submitForm}
        >
          {this.state.type === 'PAYPAL'
            ? 'Proceed to Paypal'
            : 'Confrm Payment'
          }
        </Button>
        <Button
          type="cancel"
          onClick={this.resetForm}
        >
          Cancel
        </Button>
      </ActionsPanel>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

const accountContext = withAccount((context) => ({
  accountLoading: context.loading,
  balance: context.data && context.data.balance,
}));

const enhanced = compose(styled, accountContext);

export default
  scriptLoader('https://www.paypalobjects.com/api/checkout.v4.js')
    (enhanced(MakeAPaymentPanel));
