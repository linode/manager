import { path } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import Step1 from 'src/assets/icons/referrals/step-1.svg';
import Step2 from 'src/assets/icons/referrals/step-2.svg';
import Step3 from 'src/assets/icons/referrals/step-3.svg';
import CopyableTextField from 'src/components/CopyableTextField';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import Link from 'src/components/Link';
import Notice from 'src/components/Notice';
import useFlags from 'src/hooks/useFlags';
import { MapState } from 'src/store/types';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    maxWidth: 920,
  },
  changeNotice: {
    fontSize: '0.875rem',
  },
  // @todo: Remove when referral UI changes move to GA
  copyField: {
    marginTop: theme.spacing(),
  },
  link: {
    '& label': {
      color: theme.cmrTextColors.headlineStatic,
    },
  },
  // @todo: Remove when referral UI changes move to GA
  results: {
    margin: `${theme.spacing(2)}px 0`,
  },
  resultsWrapper: {
    borderTop: '1px solid #D6D7D9',
    fontSize: '0.875rem',
    lineHeight: '1.125rem',
    marginTop: theme.spacing(2),
    paddingTop: theme.spacing(),
    width: 180,
  },
  referrals: {
    color: theme.cmrTextColors.headlineStatic,
  },
  earned: {
    color: theme.cmrTextColors.headlineStatic,
    fontFamily: theme.font.bold,
  },
  limitNotice: {
    '& p': {
      color: `${theme.cmrTextColors.tableStatic} !important`,
      fontSize: '0.875rem',
    },
  },
  images: {
    marginTop: theme.spacing(3),
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
  const flags = useFlags();

  const {
    profileLoading,
    code,
    url,
    total,
    completed,
    pending,
    credit,
  } = props;

  // If users have spent at least $25, set this to true to allow users to
  // make referrals
  // @todo: Replace with actual variable
  const allowReferral = true;

  // To see results section, uncomment the following code:
  // total = 1;
  // completed = 1;
  // credit = 25;

  // To see pending results, uncomment the following code:
  // total = 1;
  // pending = 1;

  return (
    <Paper>
      <DocumentTitleSegment segment="Referrals" />
      <Grid container className={classes.root}>
        {!flags.referral ? (
          <Grid item>
            <Typography variant="h2" data-qa-title>
              Referrals
            </Typography>
            {flags.referralBannerText?.text ? (
              <Notice
                warning
                className={classes.changeNotice}
                spacingTop={16}
                spacingBottom={16}
              >
                {flags.referralBannerText.text}{' '}
                {flags.referralBannerText.link ? (
                  <Link to={flags.referralBannerText?.link?.url}>
                    {flags.referralBannerText.link?.text}
                  </Link>
                ) : null}
              </Notice>
            ) : null}
          </Grid>
        ) : null}
        <Grid item>
          {flags.referral ? (
            <>
              <Typography variant="body1" style={{ marginBottom: 12 }}>
                When you refer friends or colleagues to Linode using your
                referral link, they’ll receive a $100, 60-day credit once a
                valid payment method is added to their new account.
              </Typography>
              <Typography variant="body1">
                When the referred customer spends $25 on Linode services, you’ll
                receive a $25 non-expiring account credit. There are no limits
                to the number of people you can refer.{' '}
                <Link to="https://www.linode.com/promotional-policy/">
                  Learn more about eligibility
                </Link>
                .
              </Typography>
            </>
          ) : (
            <Typography>
              Referrals reward you when you refer people to Linode. If someone
              signs up using your referral code, you&apos;ll receive a credit of
              $20.00, so long as the person you referred remains an active
              customer for 90 days and spends a minimum of $15.
            </Typography>
          )}
        </Grid>
        {profileLoading ? (
          <div />
        ) : (
          <>
            {!flags.referral ? (
              <Grid item>
                <Typography variant="h3" className={classes.results}>
                  You have {total} total referrals: {completed} completed ($
                  {credit}) and {pending} pending.
                </Typography>
              </Grid>
            ) : null}
            <Grid
              item
              xs={12}
              className={flags.referral ? classes.link : undefined}
            >
              {!flags.referral ? (
                <CopyableTextField
                  className={classes.copyField}
                  expand
                  label="Referral Code"
                  value={code}
                />
              ) : null}
              {allowReferral ? (
                <CopyableTextField
                  className={!flags.referral ? classes.copyField : undefined}
                  expand
                  label={
                    flags.referral
                      ? 'Your personal referral link'
                      : 'Referral URL'
                  }
                  value={url}
                />
              ) : null}
            </Grid>
            {flags.referral ? (
              <>
                <Grid item>
                  {allowReferral && total !== undefined && total > 0 ? (
                    <div className={classes.resultsWrapper}>
                      {pending != undefined && pending > 0 ? (
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
                      spacingTop={0}
                      spacingBottom={0}
                    >
                      Spend $25 with Linode to activate your personal referral
                      link
                    </Notice>
                  ) : null}
                </Grid>
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
            ) : null}
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
