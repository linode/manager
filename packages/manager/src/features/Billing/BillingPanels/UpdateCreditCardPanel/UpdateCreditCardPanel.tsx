import { Account, saveCreditCard } from 'linode-js-sdk/lib/account';
import { APIError } from 'linode-js-sdk/lib/types';
import { range, take, takeLast } from 'ramda';
import * as React from 'react';
import NumberFormat from 'react-number-format';
import { compose } from 'recompose';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Divider from 'src/components/core/Divider';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import ExpansionPanel from 'src/components/ExpansionPanel';
import Grid from 'src/components/Grid';
import NativeSelect from 'src/components/NativeSelect';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';
import accountContainer, {
  Props as AccountContainerProps
} from 'src/containers/account.container';
import { withAccount } from 'src/features/Billing/context';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';
import isCreditCardExpired from 'src/utilities/isCreditCardExpired';

type ClassNames =
  | 'root'
  | 'expired'
  | 'currentCCTitle'
  | 'currentccContainer'
  | 'newccContainer'
  | 'cardNumber'
  | 'fullWidthMobile'
  | 'cardCVV';

const styles = (theme: Theme) =>
  createStyles({
    root: {},
    expired: {
      color: theme.color.red
    },
    currentccContainer: {
      padding: `${theme.spacing(2)}px 0 ${theme.spacing(4)}px`
    },
    newccContainer: {
      padding: `${theme.spacing(1)}px 0 0`
    },
    currentCCTitle: {
      marginBottom: theme.spacing(1)
    },
    cardNumber: {
      minWidth: 225
    },
    fullWidthMobile: {
      [theme.breakpoints.down('xs')]: {
        width: '100%'
      }
    },
    cardCVV: {
      [theme.breakpoints.up('sm')]: {
        maxWidth: 143
      }
    }
  });

interface AccountContextProps {
  accountLoading: boolean;
  accountErrors: APIError[];
  expiry: string;
  last_four: string;
  updateContext: (update: (a: Account) => Account) => void;
  cvv: string;
}

interface State {
  submitting: boolean;
  errors?: APIError[];
  success?: boolean;
  card_number: string;
  expiry_month: number;
  expiry_year: number;
  cvv: string;
}

type CombinedProps = AccountContextProps &
  WithStyles<ClassNames> &
  AccountContainerProps;

class UpdateCreditCardPanel extends React.Component<CombinedProps, State> {
  state: State = {
    card_number: '',
    expiry_month: 1,
    expiry_year: UpdateCreditCardPanel.currentYear,
    submitting: false,
    cvv: ''
  };

  static currentYear = new Date().getFullYear();

  handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      card_number: e.target.value ? take(19, e.target.value) : ''
    });
  };

  handleExpiryMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      expiry_month: +e.target.value
    });
  };

  handleExpiryYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      expiry_year: +e.target.value
    });
  };

  handleCVVChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // All characters except numbers
    const regex = /(([\D]))/;

    // Prevents more than 4 characters from being submitted
    const cvv = e.target.value.slice(0, 4);
    this.setState({ cvv: cvv.replace(regex, '') });
  };

  submitForm = () => {
    const { card_number, expiry_month, expiry_year, cvv } = this.state;

    this.setState({ submitting: true, errors: undefined });

    saveCreditCard({ card_number, expiry_month, expiry_year, cvv })
      .then(() => {
        const credit_card = {
          last_four: takeLast(4, card_number),
          expiry: `${String(expiry_month).padStart(2, '0')}/${expiry_year}`,
          cvv
        };
        // Update Redux store so subscribed components will display updated
        // information.
        this.props.saveCreditCard(credit_card);

        // Update context so components within this context tree will display
        // updated information.
        this.props.updateContext(account => ({
          ...account,
          credit_card
        }));
        this.setState({
          card_number: '',
          expiry_month: 1,
          expiry_year: UpdateCreditCardPanel.currentYear,
          cvv: '',
          submitting: false,
          success: true
        });
      })
      .catch(error => {
        this.setState({
          submitting: false,
          errors: getAPIErrorOrDefault(error, 'Unable to update credit card.')
        });
      });
  };

  resetForm = () =>
    this.setState({
      card_number: '',
      errors: undefined,
      expiry_month: 1,
      expiry_year: UpdateCreditCardPanel.currentYear,
      success: undefined,
      cvv: ''
    });

  creditCardField = (props: any) => {
    const { inputRef, onChange, ...other } = props;

    return (
      <NumberFormat
        {...other}
        getInputRef={inputRef}
        onValueChange={values => {
          onChange({
            target: {
              value: values.value
            }
          });
        }}
        format="#### #### #### #######"
      />
    );
  };

  render() {
    const { classes, last_four, expiry } = this.props;
    const { errors, success } = this.state;
    const hasErrorFor = getAPIErrorFor(
      {
        card_number: 'card number',
        expiry_month: 'expiration month',
        expiry_year: 'expiration year',
        cvv: 'cvv code'
      },
      errors
    );
    const generalError = hasErrorFor('none');

    return (
      <ExpansionPanel heading="Update Credit Card" actions={this.renderActions}>
        <Grid container>
          {last_four && (
            <Grid item xs={12}>
              <div className={classes.currentccContainer}>
                <Typography variant="h2" className={classes.currentCCTitle}>
                  Current Credit Card
                </Typography>
                <Grid container>
                  <Grid item>
                    <Typography style={{ marginRight: 8 }}>
                      {`xxxx-xxxx-xxxx-${last_four}`}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Typography>
                      Exp Date:&nbsp;
                      {expiry}
                      {isCreditCardExpired(expiry) && (
                        <span className={classes.expired}>{` Expired`}</span>
                      )}
                    </Typography>
                  </Grid>
                </Grid>
              </div>
              <Divider />
            </Grid>
          )}
          <Grid item xs={12}>
            <div className={classes.newccContainer}>
              <Typography variant="h2">New Credit Card</Typography>
              {generalError && (
                <Notice error spacingTop={24} spacingBottom={8}>
                  {generalError}
                </Notice>
              )}
              {success && (
                <Notice success spacingTop={24} spacingBottom={8}>
                  Credit card successfully updated.
                </Notice>
              )}
              <Grid container>
                <Grid item xs={12}>
                  <TextField
                    required
                    label="New Card Number"
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
                  <NativeSelect
                    label="Expiration Month"
                    onChange={this.handleExpiryMonthChange}
                    errorText={hasErrorFor('expiry_month')}
                    value={this.state.expiry_month}
                    options={UpdateCreditCardPanel.monthMenuItems}
                  />
                </Grid>
                <Grid item className={classes.fullWidthMobile}>
                  <NativeSelect
                    label="Expiration Year"
                    onChange={this.handleExpiryYearChange}
                    errorText={hasErrorFor('expiry_year')}
                    value={this.state.expiry_year}
                    options={UpdateCreditCardPanel.yearMenuItems}
                  />
                </Grid>
                <Grid item className={classes.fullWidthMobile}>
                  <TextField
                    required
                    label="CVV"
                    value={this.state.cvv}
                    onChange={this.handleCVVChange}
                    errorText={hasErrorFor('cvv')}
                    placeholder="000"
                    className={classes.cardCVV}
                  />
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
        <Button
          buttonType="primary"
          onClick={this.submitForm}
          loading={this.state.submitting}
        >
          Save
        </Button>
        <Button buttonType="cancel" onClick={this.resetForm}>
          Cancel
        </Button>
      </ActionsPanel>
    );
  };

  static yearMenuItems = range(
    UpdateCreditCardPanel.currentYear,
    UpdateCreditCardPanel.currentYear + 20
  ).map((v: any) => {
    return { label: v, value: v };
  });

  static monthMenuItems = range(1, 13).map((v: any) => {
    const label = String(v).padStart(2, '0');
    return { label, value: v };
  });
}

const styled = withStyles(styles);

const accountContext = withAccount(({ loading, errors, data, update }) => {
  if (data) {
    return {
      accountLoading: loading,
      accountErrors: errors,
      expiry: data.credit_card.expiry,
      last_four: data.credit_card.last_four,
      cvv: data.credit_card.cvv,
      updateContext: update
    };
  }

  return {
    accountLoading: loading,
    accountErrors: errors
  };
});

const enhanced = compose<CombinedProps, {}>(
  styled,
  accountContext,
  accountContainer()
);

export default enhanced(UpdateCreditCardPanel) as React.ComponentType<{}>;
