import { compose } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';

import Paper from '@material-ui/core/Paper';
import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import CopyableTextField from 'src/features/Volumes/CopyableTextField';

type ClassNames = 'root'
  | 'results'
  | 'title'
  | 'copyField';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {
    padding: theme.spacing.unit * 3,
  },
  title: {
  },
  results: {
    margin: `${theme.spacing.unit * 2}px 0`,
  },
  copyField: {
    marginTop: theme.spacing.unit,
  },
});

interface Props { }

interface ConnectedProps {
  profileLoading: boolean;
  code?: string;
  url?: string;
  total?: number;
  completed?: number;
  pending?: number;
  credit?: number;
}

interface State { }

type CombinedProps = Props & ConnectedProps & WithStyles<ClassNames>;

class Referrals extends React.Component<CombinedProps, State> {
  state: State = {};

  render() {
    const {
      classes,
      profileLoading,
      code,
      url,
      total,
      completed,
      pending,
      credit,
    } = this.props;

    return (
      <Paper className={classes.root}>
        <DocumentTitleSegment segment="Referrals" />
        <Grid container>
          <Grid item xs={12}>
            <Typography
              role="header"
              variant="title"
              className={classes.title}
              data-qa-title
            >
              Referrals
          </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography>Referrals reward you when you refer people to Linode. If someone signs up using your referral code, you'll receive a credit of $20.00, so long as the person you referred remains an active customer for 90 days.</Typography>
          </Grid>
          {
            profileLoading
              ? (<div />)
              : (
                <React.Fragment>
                  <Grid item>
                    <Typography role="header" variant="subheading" className={classes.results}>
                      You have {total} total referrals: {completed} completed (${credit} ) and {pending} pending.
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <CopyableTextField value={code} label='Referral Code' className={classes.copyField} expand />
                    <CopyableTextField value={url} label='Referral URL' className={classes.copyField} expand />
                  </Grid>
                </React.Fragment>
              )
          }
        </Grid>
      </Paper>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

const connected = connect((state: Linode.AppState) => {
  const {
    loading: profileLoading,
    data: { referrals },
  } = state.resources.profile;

  return profileLoading
    ? { profileLoading: true }
    : {
      profileLoading: false,
      code: referrals.code,
      url: referrals.url,
      total: referrals.total,
      pending: referrals.pending,
      completed: referrals.completed,
      credit: referrals.credit,
    };
});

const enhanced = compose(styled, connected);

export default enhanced(Referrals);
