import { compose } from 'ramda';
import * as React from 'react';
import CircleProgress from 'src/components/CircleProgress';
import Paper from 'src/components/core/Paper';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import isCreditCardExpired from 'src/utilities/isCreditCardExpired';
import { withAccount } from '../../context';

type ClassNames = 'root' | 'expired' | 'item' | 'address2';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {
    padding: theme.spacing.unit * 2
  },
  expired: {
    color: theme.color.red
  },
  item: {
    marginBottom: theme.spacing.unit,
    ...theme.typography.body1
  },
  address2: {
    marginTop: -15,
    paddingLeft: theme.spacing.unit * 7.5
  }
});

interface AccountContextProps {
  loading: boolean;
  errors?: Linode.ApiFieldError[];
  lastUpdated: number;
  data?: Linode.Account;
}

type CombinedProps = AccountContextProps & WithStyles<ClassNames>;

export class SummaryPanel extends React.Component<CombinedProps, {}> {
  render() {
    const { classes, data, loading, errors, lastUpdated } = this.props;

    return (
      <Paper className={classes.root} data-qa-contact-summary>
        <Grid container>
          <Grid item xs={12}>
            <Typography role="header" variant="h2">
              Summary
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Grid container>
              {loading && lastUpdated === 0
                ? this.loading()
                : errors
                ? this.error()
                : data
                ? this.info()
                : null}
            </Grid>
          </Grid>
        </Grid>
      </Paper>
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
        zip
      },
      classes
    } = this.props;

    return (
      <React.Fragment>
        <Grid item md={7}>
          <Grid container>
            <Grid item xs={12}>
              <Typography role="header" variant="h3">
                Contact Information
              </Typography>
            </Grid>
            <Grid item sm={6}>
              <div className={classes.item} data-qa-company>
                <strong>Company Name: </strong>
                {company ? company : 'None'}
              </div>
              <div className={classes.item} data-qa-contact-name>
                <strong>Name: </strong>
                {!(first_name || last_name) && 'None'}
                {`${first_name} ${last_name}`}
              </div>
              <div className={classes.item} data-qa-contact-address>
                <strong>Address: </strong>
                <div className={classes.address2}>
                  {!(address_1 || address_2 || city || state || zip) && 'None'}
                  <span>{address_1}</span>
                  <div>{address_2}</div>
                  <div>{`${city} ${city &&
                    state &&
                    ', '} ${state} ${zip}`}</div>
                </div>
              </div>
            </Grid>
            <Grid item sm={6}>
              <div className={classes.item} data-qa-contact-email>
                <strong>Email: </strong>
                {email}
              </div>
              <div className={classes.item} data-qa-contact-phone>
                <strong>Phone Number: </strong>
                {phone ? phone : 'None'}
              </div>
            </Grid>
          </Grid>
        </Grid>

        <Grid item md={5}>
          <Grid item xs={12}>
            <Grid container>
              <Grid item xs={12}>
                <Typography role="header" variant="h3">
                  Billing Information
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <div className={classes.item} data-qa-contact-cc>
                  <strong>Credit Card: </strong>
                  {last_four ? `xxxx-xxxx-xxxx-${last_four}` : 'None'}
                </div>
                <div className={classes.item} data-qa-contact-cc-exp-date>
                  <strong>Expiration Date: </strong>
                  {expiry ? `${expiry} ` : 'None'}
                  {expiry && isCreditCardExpired(expiry) && (
                    <span className={classes.expired}>Expired</span>
                  )}
                </div>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </React.Fragment>
    );
  };
}

const styled = withStyles(styles);

const accountContext = withAccount(
  ({ data, errors, loading, lastUpdated }) => ({
    errors,
    lastUpdated,
    loading,
    data
  })
);

const enhanced = compose(
  styled,
  accountContext
);

export default enhanced(SummaryPanel) as React.ComponentType<{}>;
