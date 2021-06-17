import { path } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import CopyableTextField from 'src/components/CopyableTextField';
import Paper from 'src/components/core/Paper';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import Link from 'src/components/Link';
import Notice from 'src/components/Notice';
import withFeatureFlags, {
  FeatureFlagConsumerProps,
} from 'src/containers/withFeatureFlagConsumer.container';
import { MapState } from 'src/store/types';

type ClassNames = 'results' | 'copyField';

const styles = (theme: Theme) =>
  createStyles({
    results: {
      margin: `${theme.spacing(2)}px 0`,
    },
    copyField: {
      marginTop: theme.spacing(1),
    },
  });

type CombinedProps = StateProps &
  WithStyles<ClassNames> &
  FeatureFlagConsumerProps;

class Referrals extends React.Component<CombinedProps, {}> {
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
      flags,
    } = this.props;

    return (
      <Paper>
        <DocumentTitleSegment segment="Referrals" />
        <Grid container>
          <Grid item xs={12}>
            <Typography variant="h2" data-qa-title>
              Referrals
            </Typography>
            {flags.referralBannerText?.text ? (
              <Notice warning spacingTop={16} spacingBottom={16}>
                {flags.referralBannerText.text}{' '}
                {flags.referralBannerText.link ? (
                  <Link to={flags.referralBannerText?.link?.url}>
                    {flags.referralBannerText.link?.text}
                  </Link>
                ) : null}
              </Notice>
            ) : null}
          </Grid>
          <Grid item xs={12}>
            <Typography>
              Referrals reward you when you refer people to Linode. If someone
              signs up using your referral code, you&apos;ll receive a credit of
              $20.00, so long as the person you referred remains an active
              customer for 90 days and spends a minimum of $15.
            </Typography>
          </Grid>
          {profileLoading ? (
            <div />
          ) : (
            <React.Fragment>
              <Grid item>
                <Typography variant="h3" className={classes.results}>
                  You have {total} total referrals: {completed} completed ($
                  {credit}) and {pending} pending.
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <CopyableTextField
                  value={code}
                  label="Referral Code"
                  className={classes.copyField}
                  expand
                />
                <CopyableTextField
                  value={url}
                  label="Referral URL"
                  className={classes.copyField}
                  expand
                />
              </Grid>
            </React.Fragment>
          )}
        </Grid>
      </Paper>
    );
  }
}

const styled = withStyles(styles);

interface StateProps {
  profileLoading: boolean;
  code?: string;
  url?: string;
  total?: number;
  completed?: number;
  pending?: number;
  credit?: number;
}

const mapStateToProps: MapState<StateProps, {}> = (state) => {
  const { profile } = state.__resources;

  return {
    profileLoading: profile.loading,
    code: path(['data', 'referrals', 'code'], profile),
    url: path(['data', 'referrals', 'url'], profile),
    total: path(['data', 'referrals', 'total'], profile),
    completed: path(['data', 'referrals', 'completed'], profile),
    pending: path(['data', 'referrals', 'pending'], profile),
    credit: path(['data', 'referrals', 'credit'], profile),
  };
};

const connected = connect(mapStateToProps);

const enhanced = compose<CombinedProps, {}>(
  styled,
  connected,
  withFeatureFlags
);

export default enhanced(Referrals);
