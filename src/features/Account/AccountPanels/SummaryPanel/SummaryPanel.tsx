import * as React from 'react';

import {
  StyleRulesCallback,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles';

import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

import Grid from 'src/components/Grid';

import { isCreditCardExpired } from 'src/utilities/isCreditCardExpired';

type ClassNames = 'root'
| 'expired';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme & Linode.Theme) => ({
  root: {},
  expired: {
    color: theme.color.red,
  }
});

interface Props {
  company: string;
  name: string;
  address1: string;
  address2: string;
  email: string;
  phone: string;
  cc_exp: string;
  cc_lastfour: string;
  city: string;
  state: string;
  zip: string;
}

interface State { }

type CombinedProps = Props & WithStyles<ClassNames>;

export class SummaryPanel extends React.Component<CombinedProps, State> {
  state: State = {};

  render() {
    const {
      classes,
      company,
      name,
      address1,
      address2,
      email,
      phone,
      cc_exp,
      cc_lastfour,
      city,
      state,
      zip
    } = this.props;

    return (
      <Paper>
        <Grid container>
          <Grid item xs={12}>
            <Typography variant="headline">
              Summary
          </Typography>
          </Grid>

          <Grid item xs={6}>
            <Grid container>
              <Grid item xs={12}>
                <Typography variant="title">
                  Contact Information
              </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption">
                  <strong>Company Name: </strong>
                  {company}
              </Typography>
                <Typography variant="caption">
                  <strong>Name: </strong>
                  {name}
              </Typography>
                <Typography variant="caption">
                  <strong>Address: </strong>
                  <span>{address1}</span>
                  <span>{address2}</span>
                  <div>{`${city}, ${state} ${zip}`}</div>
              </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption">
                  <strong>Email: </strong>
                  {email}
              </Typography>
                <Typography variant="caption">
                  <strong>Phone Number: </strong>
                  {phone}
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
                {`xxxx-xxxx-xxxx-${cc_lastfour}`}
              </Typography>
              <Typography variant="caption">
                <strong>Expiration Date: </strong>
                {`${cc_exp} `}
                {isCreditCardExpired(cc_exp) &&
                  <span className={classes.expired}>Expired</span>
                }
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(SummaryPanel);
