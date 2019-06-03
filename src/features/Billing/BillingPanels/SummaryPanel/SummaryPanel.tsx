import * as classNames from 'classnames';
import { compose } from 'ramda';
import * as React from 'react';
import CircleProgress from 'src/components/CircleProgress';
import Paper from 'src/components/core/Paper';
import {
  createStyles,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Currency from 'src/components/Currency';
import DateTimeDisplay from 'src/components/DateTimeDisplay';
import ErrorState from 'src/components/ErrorState';
import styled, { StyleProps } from 'src/containers/SummaryPanels.styles';
import isCreditCardExpired from 'src/utilities/isCreditCardExpired';
import { withAccount } from '../../context';

type ClassNames = 'expired' | 'balance' | 'positive' | 'negative' | 'wordWrap';

const styles = (theme: Theme) =>
  createStyles({
  root: {},
  title: {},
  summarySection: {},
  section: {},
  main: {},
  sidebar: {},
  domainSidebar: {},
  titleWrapper: {},
  expired: {
    color: theme.color.red
  },
  balance: {
    display: 'flex'
  },
  positive: {
    color: theme.color.green
  },
  negative: {
    color: theme.color.red
  },
  wordWrap: {
    wordBreak: 'break-all'
  }
});

interface AccountContextProps {
  loading: boolean;
  errors?: Linode.ApiFieldError[];
  lastUpdated: number;
  data?: Linode.Account;
  accountLoading: boolean;
  balance: false | number;
  balance_uninvoiced?: number;
}

type CombinedProps = AccountContextProps & StyleProps & WithStyles<ClassNames>;

export class SummaryPanel extends React.Component<CombinedProps, {}> {
  render() {
    const { data, loading, errors, lastUpdated } = this.props;

    return (
      <div>
        {loading && lastUpdated === 0
          ? this.loading()
          : errors
          ? this.error()
          : data
          ? this.info()
          : null}
      </div>
    );
  }

  loading = () => {
    return <CircleProgress noTopMargin />;
  };

  error = () => {
    return <ErrorState compact errorText="Unable to load account details." />;
  };

  info = () => {
    if (!this.props.data) {
      return;
    }

    const {
      data: {
        company,
        first_name,
        last_name,
        address_1,
        address_2,
        email,
        phone,
        credit_card: { expiry, last_four },
        city,
        state,
        zip,
        active_since
      },
      balance,
      balance_uninvoiced,
      accountLoading,
      classes
    } = this.props;

    const shouldDisplayBalance = !accountLoading && balance !== false;

    return (
      <React.Fragment>
        <Paper className={classes.summarySection} data-qa-contact-summary>
          <Typography variant="h3" className={classes.title}>
            Contact Information
          </Typography>

          <div className={classes.section} data-qa-company>
            <strong>Company Name:&nbsp;</strong>
            <div className={classes.wordWrap}>{company ? company : 'None'}</div>
          </div>
          <div className={classes.section} data-qa-contact-name>
            <strong>Name:&nbsp;</strong>
            {!(first_name || last_name) && 'None'}
            <div
              className={classes.wordWrap}
            >{`${first_name} ${last_name}`}</div>
          </div>
          <div className={classes.section} data-qa-contact-address>
            <div>
              <strong>Address:&nbsp;</strong>
            </div>
            <div>
              {!(address_1 || address_2 || city || state || zip) && 'None'}
              <span>{address_1}</span>
              <div>{address_2}</div>
              <div>{`${city} ${city && state && ', '} ${state} ${zip}`}</div>
            </div>
          </div>
          <div className={classes.section} data-qa-contact-email>
            <strong>Email:&nbsp;</strong>
            <div className={classes.wordWrap}>{email}</div>
          </div>
          <div className={classes.section} data-qa-contact-phone>
            <strong>Phone Number:&nbsp;</strong>
            {phone ? phone : 'None'}
          </div>
          <div className={classes.section}>
            <strong>Active Since:&nbsp;</strong>
            <DateTimeDisplay value={active_since} format="MMMM D, YYYY" />
          </div>
        </Paper>

        <Paper className={classes.summarySection} data-qa-billing-summary>
          <Typography variant="h3" className={classes.title}>
            Billing Information
          </Typography>
          {balance_uninvoiced !== undefined && (
            <div className={classes.section} data-qa-contact-cc>
              <strong>Uninvoiced Balance:&nbsp;</strong>
              <Currency quantity={balance_uninvoiced} />
            </div>
          )}
          <div
            className={`${classes.section} ${classes.balance}`}
            data-qa-current-balance
          >
            <strong>Current Balance:&nbsp;</strong>
            <Typography
              component={'span'}
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
          </div>
          <div className={classes.section} data-qa-contact-cc>
            <strong>Credit Card: </strong>
            {last_four ? `xxxx-xxxx-xxxx-${last_four}` : 'None'}
          </div>
          <div className={classes.section} data-qa-contact-cc-exp-date>
            <strong>Expiration Date: </strong>
            {expiry ? `${expiry} ` : 'None'}
            {expiry && isCreditCardExpired(expiry) && (
              <span className={classes.expired}>Expired</span>
            )}
          </div>
        </Paper>
      </React.Fragment>
    );
  };
}

const localStyles = withStyles(styles);

const accountContext = withAccount(
  ({ data, errors, loading, lastUpdated }) => ({
    accountLoading: loading,
    balance: data && data.balance,
    balance_uninvoiced: data && data.balance_uninvoiced,
    errors,
    lastUpdated,
    loading,
    data
  })
);

const enhanced = compose(
  styled,
  localStyles,
  accountContext
);

export default enhanced(SummaryPanel) as React.ComponentType<{}>;
