import { compose, pathOr, range, take, takeLast } from 'ramda';
import * as React from 'react';
import NumberFormat from 'react-number-format';

import Divider from '@material-ui/core/Divider';
import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ExpansionPanel from 'src/components/ExpansionPanel';
import Grid from 'src/components/Grid';
import MenuItem from 'src/components/MenuItem';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';
import { withAccount } from 'src/features/Account/context';
import { saveCreditCard } from 'src/services/account';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';
import { isCreditCardExpired } from 'src/utilities/isCreditCardExpired';

type ClassNames = 'root'
  | 'expired'
  | 'currentCCTitle'
  | 'currentccContainer'
  | 'newccContainer'
  | 'cardNumber'
  | 'fullWidthMobile';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
  expired: {
    color: theme.color.red,
  },
  currentccContainer: {
    padding: `${theme.spacing.unit * 2}px 0 ${theme.spacing.unit * 4}px`,
  },
  newccContainer: {
    padding: `${theme.spacing.unit}px 0 0`,
  },
  currentCCTitle: {
    marginBottom: theme.spacing.unit,
  },
  cardNumber: {
    minWidth: 225,
  },
  fullWidthMobile: {
    [theme.breakpoints.down('xs')]: {
      width: '100%',
    },
  },
});

interface AccountContextProps {
  accountLoading: boolean;
  accountErrors: Linode.ApiFieldError[];
  expiry: string;
  last_four: string;
  updateAccount: (update: (a: Linode.Account) => Linode.Account) => void,
}

interface State {
  submitting: boolean;
  errors?: Linode.ApiFieldError[];
  success?: boolean;
  card_number: string;
  expiry_month: number;
  expiry_year: number;
}

type CombinedProps = AccountContextProps & WithStyles<ClassNames>;

class UpdateCreditCardPanel extends React.Component<CombinedProps, State> {
  state: State = {
    card_number: '',
    expiry_month: 1,
    expiry_year: UpdateCreditCardPanel.currentYear,
    submitting: false,
  };

  static currentYear = new Date().getFullYear();

  handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ card_number: e.target.value ? take(19, e.target.value) : '' });
  }

  handleExpiryMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    this.setState({ expiry_month: +e.target.value });
  }

  handleExpiryYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    this.setState({ expiry_year: +e.target.value });
  }

  submitForm = () => {
    const { card_number, expiry_month, expiry_year } = this.state;

    this.setState({ submitting: true, errors: undefined });

    saveCreditCard({ card_number, expiry_month, expiry_year })
      .then(() => {
        this.props.updateAccount((account) => ({
          ...account,
          credit_card: {
            last_four: takeLast(4, card_number),
            expiry: `${String(expiry_month).padStart(2, '0')}/${expiry_year}`
          }

        }))
        this.setState({
          card_number: '',
          expiry_month: 1,
          expiry_year: UpdateCreditCardPanel.currentYear,
          submitting: false,
          success: true,
        })
      })
      .catch((error) => {
        this.setState({
          submitting: false,
          errors: pathOr([{ reason: 'Unable to update credit card.' }], ['response', 'data', 'errors'], error),
        })
      })
  };

  resetForm = () => this.setState({
    card_number: '',
    errors: undefined,
    expiry_month: 1,
    expiry_year: UpdateCreditCardPanel.currentYear,
    success: undefined,
  });

  creditCardField = (props: any) => {
    const { inputRef, onChange, ...other } = props;

    return (
      <NumberFormat
        {...other}
        ref={inputRef}
        onValueChange={values => {
          onChange({
            target: {
              value: values.value,
            },
          });
        }}
        format="#### #### #### #######"
      />
    );
  }

  render() {
    const { classes, last_four, expiry } = this.props;
    const { errors, success } = this.state;
    const hasErrorFor = getAPIErrorFor({
      card_number: 'card number',
      expiry_month: 'expiration month',
      expiry_year: 'expiration year',
    }, errors)
    const generalError = hasErrorFor('none');

    return (
      <ExpansionPanel
        heading="Update Credit Card"
        actions={this.renderActions}
      >
        <Grid container>
          <Grid item xs={12}>
            <div className={classes.currentccContainer}>
              <Typography role="header" variant="title" className={classes.currentCCTitle}>Current Credit Card</Typography>
              <Grid container>
                <Grid item>
                  <Typography style={{ marginRight: 8 }}>
                    {(last_four)
                      ? `xxxx-xxxx-xxxx-${last_four}`
                      : 'None'
                    }
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography>
                    Exp Date:&nbsp;
                    {(expiry)
                      ? `${expiry} `
                      : 'None'
                    }
                    {expiry && isCreditCardExpired(expiry) &&
                      <span className={classes.expired}>Expired</span>
                    }
                  </Typography>
                </Grid>
              </Grid>
            </div>
            <Divider />
          </Grid>
          <Grid item xs={12}>
            <div className={classes.newccContainer}>
              <Typography role="header" variant="title">New Credit Card</Typography>
              {generalError && <Notice error spacingTop={24} spacingBottom={8}>{generalError}</Notice>}
              {success && <Notice success spacingTop={24} spacingBottom={8}>Credit card successfully updated.</Notice>}
              <Grid container>
                <Grid item xs={12}>
                  <TextField
                    required
                    label='New Card Number'
                    value={this.state.card_number}
                    onChange={this.handleCardNumberChange}
                    errorText={hasErrorFor('card_number')}
                    className={classes.cardNumber}
                    InputProps={{
                      inputComponent: this.creditCardField
                    }}
                  />
                </Grid>

                <Grid item className={classes.fullWidthMobile}>
                  <TextField
                    required
                    select
                    label='Expiration Month'
                    value={this.state.expiry_month}
                    onChange={this.handleExpiryMonthChange}
                    errorText={hasErrorFor('expiry_month')}
                  >
                    {UpdateCreditCardPanel.monthMenuItems}
                  </TextField>
                </Grid>

                <Grid item className={classes.fullWidthMobile}>
                  <TextField
                    required
                    select
                    label='Expiration Year'
                    value={this.state.expiry_year}
                    onChange={this.handleExpiryYearChange}
                    errorText={hasErrorFor('expiry_year')}
                  >
                    {UpdateCreditCardPanel.yearMenuItems}
                  </TextField>
                </Grid>
              </Grid>
            </div>
          </Grid>
        </Grid>
      </ExpansionPanel>
    );
  }

  renderActions = () => {
    return (
      <ActionsPanel>
        <Button type="primary" onClick={this.submitForm} loading={this.state.submitting}>Save</Button>
        <Button type="cancel" onClick={this.resetForm}>Cancel</Button>
      </ActionsPanel>
    );
  };

  static yearMenuItems = range(
    UpdateCreditCardPanel.currentYear,
    UpdateCreditCardPanel.currentYear + 20
  )
    .map((v: number) => <MenuItem key={v} value={v}>{v}</MenuItem>)

  static monthMenuItems = range(1, 13)
    .map((v: number) => <MenuItem key={v} value={v}>{String(v).padStart(2, '0')}</MenuItem>)
}

const styled = withStyles(styles, { withTheme: true });

const accountContext = withAccount(({ loading, errors, data, update }) => {
  if (data) {
    return {
      accountLoading: loading,
      accountErrors: errors,
      expiry: data.credit_card.expiry,
      last_four: data.credit_card.last_four,
      updateAccount: update,
    }
  }

  return {
    accountLoading: loading,
    accountErrors: errors,
  }
});

const enhanced = compose(styled, accountContext)

export default enhanced(UpdateCreditCardPanel);
