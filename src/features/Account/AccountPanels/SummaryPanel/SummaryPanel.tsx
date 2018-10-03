import { compose } from 'ramda';
import * as React from 'react';

import Paper from '@material-ui/core/Paper';
import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import CircleProgress from 'src/components/CircleProgress';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import { isCreditCardExpired } from 'src/utilities/isCreditCardExpired';

import { withAccount } from '../../context';

type ClassNames = 'root'
  | 'expired'
  | 'item'
  | 'address2';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {
    padding: theme.spacing.unit * 3,
  },
  expired: {
    color: theme.color.red,
  },
  item: {
    marginBottom: theme.spacing.unit,
  },
  address2: {
    paddingLeft: theme.spacing.unit * 7.5,
  }
});

interface AccountContextProps {
  loading: boolean,
  errors?: Linode.ApiFieldError[],
  lastUpdated: number,
  data?: Linode.Account;
}

type CombinedProps = AccountContextProps & WithStyles<ClassNames>;

export class SummaryPanel extends React.Component<CombinedProps, {}> {
  render() {
    const { classes, data, loading, errors, lastUpdated } = this.props;

    return (
      <Paper className={classes.root}>
        <Grid container>
          <Grid item xs={12}>
            <Typography role="header" variant="title">
              Summary
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Grid container>
              {
                loading && lastUpdated === 0
                ? this.loading()
                : errors
                  ? this.error()
                  : data
                    ? this.info()
                    : null
              }
            </Grid>
          </Grid>
        </Grid>
      </Paper>
    );
  }

  loading = () => {
    return (
      <CircleProgress noTopMargin />
    );
  }

  error = () => {
    return (
      <ErrorState compact errorText="Unable to load account details." />
    );
  }

  info = () => {
    if (!this.props.data) { return; }

    const {
      data: {
        company,
        first_name,
        last_name,
        address_1,
        address_2,
        email,
        phone,
        credit_card: {
          expiry,
          last_four,
        },
        city,
        state,
        zip,
      },
      classes,
    } = this.props;

    return (
      <React.Fragment>
        <Grid item md={7}>
          <Grid container>
            <Grid item xs={12}>
              <Typography role="header" variant="subheading">
                Contact Information
              </Typography>
              </Grid>
              <Grid item sm={6}>
                <Typography variant="caption" className={classes.item}>
                  <strong>Company Name: </strong>
                  {company ? company : 'None'}
              </Typography>
                <Typography variant="caption" className={classes.item}>
                  <strong>Name: </strong>
                  {!(first_name || last_name) && 'None'}
                  {`${first_name} ${last_name}`}
              </Typography>
              <Typography variant="caption" className={classes.item}>
                <strong>Address: </strong>
                {!(address_1 || address_2 || city || state || zip) && 'None'}
                <span>{address_1}</span>
                <div className={classes.address2}>{address_2}</div>
                <div className={classes.address2}>
                  {`${city} ${city && state && ', '} ${state} ${zip}`}
                </div>
              </Typography>
            </Grid>
            <Grid item sm={6}>
              <Typography variant="caption" className={classes.item}>
                <strong>Email: </strong>
                {email}
              </Typography>
                <Typography variant="caption" className={classes.item}>
                  <strong>Phone Number: </strong>
                  {phone ? phone : 'None'}
              </Typography>
            </Grid>
          </Grid>
        </Grid>

        <Grid item md={5}>
          <Grid item xs={12}>
            <Grid container>
              <Grid item xs={12}>
                <Typography role="header" variant="subheading">
                  Billing Information
                  </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" className={classes.item}>
                  <strong>Credit Card: </strong>
                  {(last_four)
                    ? `xxxx-xxxx-xxxx-${last_four}`
                    : 'None'
                  }
                </Typography>
                <Typography variant="caption" className={classes.item}>
                  <strong>Expiration Date: </strong>
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
          </Grid>
        </Grid>
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

const accountContext = withAccount(({ data, errors, loading, lastUpdated }) => ({
  errors,
  lastUpdated,
  loading,
  data,
}));

const enhanced = compose(styled, accountContext);

export default enhanced(SummaryPanel);
