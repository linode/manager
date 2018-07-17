import { compose } from 'ramda';
import * as React from 'react';

import Paper from '@material-ui/core/Paper';
import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import CircleProgress from 'src/components/CircleProgress';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import { isCreditCardExpired } from 'src/utilities/isCreditCardExpired';

import { withAccount } from '../../context';

type ClassNames = 'root'
| 'expired'
| 'item';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme & Linode.Theme) => ({
  root: {
    padding: theme.spacing.unit * 3,
  },
  expired: {
    color: theme.color.red,
  },
  item: {
    marginBottom: theme.spacing.unit,
  },
});

interface Props { }

interface AccountContextProps {
  loading: boolean,
  errors?: Linode.ApiFieldError[],
  lastUpdated: number,
  data?: Linode.Account;
}

interface State { }

type CombinedProps = Props & AccountContextProps & WithStyles<ClassNames>;

export class SummaryPanel extends React.Component<CombinedProps, State> {
  state: State = {};

  render() {
    const { classes, data, loading, errors, lastUpdated } = this.props;

    if (lastUpdated === 0 && loading) {
      return this.loading();
    }

    if (errors) {
      return this.error();
    }

    if (!data) { return null; }

    return (
      <Paper className={classes.root}>
        <Grid container>
          <Grid item xs={12}>
            <Typography variant="title">
              Summary
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Grid container>
              {
                loading ? this.loading() : errors ? this.error() : this.info()
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
        <Grid item xs={6}>
          <Grid container>
            <Grid item xs={12}>
              <Typography variant="title">
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
                  <span>{address_2}</span>
                  <div>{`${city} ${city && state && ', '} ${state} ${zip}`}</div>
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption">
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

        <Grid item xs={6}>
          <Grid item xs={12}>
            <Typography variant="title">
              Billing Information
              </Typography>
            <Typography variant="caption">
              <strong>Credit Card: </strong>
              {`xxxx-xxxx-xxxx-${last_four}`}
            </Typography>
            <Typography variant="caption">
              <strong>Expiration Date: </strong>
              {`${expiry} `}
              {isCreditCardExpired(expiry) &&
                <span className={classes.expired}>Expired</span>
              }
            </Typography>
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
