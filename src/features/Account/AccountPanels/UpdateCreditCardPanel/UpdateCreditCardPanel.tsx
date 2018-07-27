import { compose, pathOr, range, takeLast } from 'ramda';
import * as React from 'react';

import Divider from '@material-ui/core/Divider';
import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
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

type ClassNames = 'root' | 'item' | 'expired';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme & Linode.Theme) => ({
  root: {},
  expired: {
    color: theme.color.red,
  },
  item: {
    marginBottom: theme.spacing.unit,
  },
});

interface Props { }

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

type CombinedProps = Props & AccountContextProps & WithStyles<ClassNames>;

class UpdateCreditCardPanel extends React.Component<CombinedProps, State> {
  state: State = {
    card_number: '',
    expiry_month: 1,
    expiry_year: 2018,
    submitting: false,
  };

  handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ card_number: e.target.value || '' });
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
          expiry_year: 2018,
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
    expiry_year: 2018,
    success: undefined,
  });

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
        defaultExpanded
        heading="Update Credit Card"
        actions={this.renderActions}
      >
        <Grid container>
          <Grid item xs={12}>
            <Typography variant="headline">Current Credit Card</Typography>
            <Typography style={{ display: 'inline', marginRight: '8px' }} variant="subheading" className={classes.item}>
              {(last_four)
                ? `xxxx-xxxx-xxxx-${last_four}`
                : 'None'
              }
            </Typography>
            <Typography style={{ display: 'inline' }} variant="subheading" className={classes.item}>
              <strong>Exp Date: </strong>
              {(expiry)
                ? `${expiry} `
                : 'None'
              }
              {expiry && isCreditCardExpired(expiry) &&
                <span className={classes.expired}>Expired</span>
              }
            </Typography>
            <Divider />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="headline">New Credit Card</Typography>
            {generalError && <Notice error>{generalError}</Notice>}
            {success && <Notice success>Credit card successfully updated.</Notice>}
            <TextField
              required
              type="number"
              label='New Card Number'
              value={this.state.card_number}
              onChange={this.handleCardNumberChange}
              errorText={hasErrorFor('card_number')}
            />
            <TextField
              required
              select
              label='Month'
              value={this.state.expiry_month}
              onChange={this.handleExpiryMonthChange}
              errorText={hasErrorFor('expiry_month')}
            >
              {UpdateCreditCardPanel.monthMenuItems}
            </TextField>
            <TextField
              required
              select
              label='Year'
              value={this.state.expiry_year}
              onChange={this.handleExpiryYearChange}
              errorText={hasErrorFor('expiry_year')}
            >
              {UpdateCreditCardPanel.yearMenuItems}
            </TextField>
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

  static genMenuItems = (r: number[]) => r.map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>);

  static monthMenuItems = UpdateCreditCardPanel.genMenuItems(range(1, 13))

  static yearMenuItems = UpdateCreditCardPanel.genMenuItems(range(2018, 2039))
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
