import * as classNames from 'classnames';
import { compose, pathOr } from 'ramda';
import * as React from 'react';

// import FormControlLabel from '@material-ui/core/FormControlLabel';
// import RadioGroup from '@material-ui/core/RadioGroup';
import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ExpansionPanel from 'src/components/ExpansionPanel';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
// import Radio from 'src/components/Radio';
import TextField from 'src/components/TextField';
import { withAccount } from 'src/features/Account/context';
import { makePayment } from 'src/services/account';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';

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
}

interface AccountContextProps {
  accountLoading: boolean;
  balance: false | number,
}

type CombinedProps = Props
  & AccountContextProps
  & WithStyles<ClassNames>;

class MakeAPaymentPanel extends React.Component<CombinedProps, State> {
  state: State = {
    type: 'CREDIT_CARD',
    submitting: false,
    usd: '',
    ccv: '',
  };

  handleTypeChange = () => null;

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

  render() {
    const { accountLoading, balance, classes } = this.props;
    const { errors, success } = this.state;

    const hasErrorFor = getAPIErrorFor({
      usd: 'amount',
      ccv: 'ccv',
    }, errors);

    const generalError = hasErrorFor('none');
    const balanceDisplay = !accountLoading && balance !== false ? `$${Math.abs(balance).toFixed(2)}` : '';
    return (
      <ExpansionPanel heading="Make a Payment" actions={this.renderActions}>
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
                </Typography>
              </Grid>
            </Grid>
          </Grid>

          {/* Payment */}
          <Grid item xs={12}>
            {generalError && <Notice error text={generalError} />}
            {success && <Notice success text={`Payment successfully submitted.`} />}
            {/* <RadioGroup // Hide this choice until PayPal component is completed.
              aria-label="payment type"
              name="type"
              value={this.state.type}
              onChange={this.handleTypeChange}
              row
            >
              <FormControlLabel value="CREDIT_CARD" label="Credit Card" control={<Radio disabled />} />
              <FormControlLabel value="PAYPAL" label="Paypal" control={<Radio disabled />} />
            </RadioGroup> */}
            <TextField
              errorText={hasErrorFor('usd')}
              label="Amount to Charge"
              onChange={this.handleUSDChange}
              value={this.state.usd}
              required
              type="number"
              placeholder={`1.00`}
            />
            <TextField
              errorText={hasErrorFor('ccv')}
              label="CCV"
              onChange={this.handleCCVChange}
              value={this.state.ccv}
              required
              type="number"
              placeholder={`000`}
            />
          </Grid>
        </Grid>
      </ExpansionPanel>
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
          Confirm Payment
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

export default enhanced(MakeAPaymentPanel);
