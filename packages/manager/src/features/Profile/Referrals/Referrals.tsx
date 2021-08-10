import { path } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import Step1 from 'src/assets/referrals/step-1.svg';
import Step2 from 'src/assets/referrals/step-2.svg';
import Step3 from 'src/assets/referrals/step-3.svg';
import CopyableTextField from 'src/components/CopyableTextField';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import Link from 'src/components/Link';
import Notice from 'src/components/Notice';
import { MapState } from 'src/store/types';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    maxWidth: 920,
  },
  link: {
    '& label': {
      color: theme.cmrTextColors.headlineStatic,
    },
  },
  resultsWrapper: {
    borderTop: '1px solid #D6D7D9',
    fontSize: '0.875rem',
    lineHeight: '1.125rem',
    marginTop: theme.spacing(3),
    marginLeft: theme.spacing(),
    paddingTop: theme.spacing(),
    width: 180,
  },
  referrals: {
    color: theme.cmrTextColors.headlineStatic,
  },
  earned: {
    color: theme.color.green,
    fontFamily: theme.font.bold,
  },
  limitNotice: {
    marginLeft: theme.spacing(),
    '& p': {
      color: `${theme.cmrTextColors.tableStatic} !important`,
      fontSize: '0.875rem',
    },
  },
  images: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(),
    maxWidth: 850,
    '& svg': {
      height: 145,
      width: 145,
      [theme.breakpoints.only('sm')]: {
        height: 120,
        width: 120,
      },
    },
    [theme.breakpoints.down('xs')]: {
      flexDirection: 'column',
      alignItems: 'center',
    },
  },
  image: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    '& svg': {
      color: theme.cmrBGColors.bgReferralsImage,
    },
    [theme.breakpoints.down('xs')]: {
      marginBottom: theme.spacing(2),
    },
  },
  imageCopy: {
    color: theme.cmrTextColors.headlineStatic,
    fontFamily: theme.font.bold,
    textAlign: 'center',
    marginTop: theme.spacing(2),
    [theme.breakpoints.up('sm')]: {
      maxWidth: 216,
    },
  },
}));

type CombinedProps = StateProps;

export const Referrals: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();

  const { profileLoading, url, total, completed, pending, credit } = props;

  const allowReferral = Boolean(url);

  return (
    <Paper>
      <DocumentTitleSegment segment="Referrals" />
      <Grid container className={classes.root}>
        <Grid item>
          <Typography variant="body1" style={{ marginBottom: 12 }}>
            When you refer friends or colleagues to Linode using your referral
            link, they&apos;ll receive a $100, 60-day credit once a valid
            payment method is added to their new account.
          </Typography>
          <Typography variant="body1">
            When the referred customer spends $25 on Linode services, and has
            remained an active customer in good standing for 90 days,
            you&apos;ll receive a $25 non-expiring account credit. There are no
            limits to the number of people you can refer.{' '}
            <Link to="https://www.linode.com/promotional-policy/">
              Read more about our promotions policy
            </Link>
            .
          </Typography>
        </Grid>
        {profileLoading ? (
          <div />
        ) : (
          <>
            <Grid item xs={12} className={classes.link}>
              {allowReferral ? (
                <CopyableTextField
                  expand
                  label="Your personal referral link"
                  value={url}
                />
              ) : null}
            </Grid>
            {allowReferral && total !== undefined && total > 0 ? (
              <div className={classes.resultsWrapper}>
                {pending !== undefined && pending > 0 ? (
                  <Grid
                    container
                    justify="space-between"
                    className={classes.referrals}
                  >
                    <Grid item>Pending referrals</Grid>
                    <Grid item>{pending}</Grid>
                  </Grid>
                ) : null}
                <Grid
                  container
                  justify="space-between"
                  className={classes.referrals}
                >
                  <Grid item>Completed referrals</Grid>
                  <Grid item>{completed}</Grid>
                </Grid>
                <Grid
                  container
                  justify="space-between"
                  className={classes.earned}
                >
                  <Grid item>Credit earned</Grid>
                  <Grid item>${credit}</Grid>
                </Grid>
              </div>
            ) : null}
            {!allowReferral ? (
              <Notice
                warning
                className={classes.limitNotice}
                spacingTop={8}
                spacingBottom={0}
              >
                Spend $25 with Linode to activate your personal referral link
              </Notice>
            ) : null}
            <Grid
              container
              direction="row"
              justify="space-between"
              wrap="nowrap"
              className={classes.images}
            >
              <Grid item className={classes.image}>
                <Step1 />
                <Typography variant="body1" className={classes.imageCopy}>
                  Share your referral link with friends and colleagues
                </Typography>
              </Grid>
              <Grid item className={classes.image}>
                <Step2 />
                <Typography variant="body1" className={classes.imageCopy}>
                  They sign up and receive a $100, 60-day credit
                </Typography>
              </Grid>
              <Grid item className={classes.image}>
                <Step3 />
                <Typography variant="body1" className={classes.imageCopy}>
                  You earn $25 after they make their first payment of $25
                </Typography>
              </Grid>
            </Grid>
          </>
        )}
      </Grid>
    </Paper>
  );
};

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

const enhanced = compose<CombinedProps, {}>(connected);

export default enhanced(Referrals);
