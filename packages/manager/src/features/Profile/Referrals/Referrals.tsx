import { useProfile } from '@linode/queries';
import { CircleProgress, Notice, Paper, Typography } from '@linode/ui';
import Grid from '@mui/material/Grid2';
import { createLazyRoute } from '@tanstack/react-router';
import * as React from 'react';

import Step1 from 'src/assets/referrals/step-1.svg';
import Step2 from 'src/assets/referrals/step-2.svg';
import Step3 from 'src/assets/referrals/step-3.svg';
import { CopyableTextField } from 'src/components/CopyableTextField/CopyableTextField';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { Link } from 'src/components/Link';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import {
  StyledEarnedGrid,
  StyledImageCopy,
  StyledImageGrid,
  StyledImagesGridContainer,
  StyledLimitNotice,
  StyledReferralGrid,
  StyledResultsWrapper,
} from './Referrals.styles';

export const Referrals = () => {
  const {
    data: profile,
    error: profileError,
    isLoading: profileLoading,
  } = useProfile();

  if (profileError) {
    return (
      <Notice
        text={
          getAPIErrorOrDefault(
            profileError,
            'Unable to load referral information.'
          )[0].reason
        }
        variant="error"
      />
    );
  }

  if (profileLoading || !profile) {
    return <CircleProgress />;
  }

  const { completed, credit, pending, total, url } = profile.referrals;
  const allowReferral = Boolean(url);

  return (
    <Paper>
      <DocumentTitleSegment segment="Referrals" />
      <Grid container spacing={2} sx={{ maxWidth: 920 }}>
        <Grid>
          <Typography style={{ marginBottom: 12 }} variant="body1">
            When you refer friends or colleagues to Linode using your referral
            link, they&rsquo;ll receive a $100, 60-day credit once a valid
            payment method is added to their new account.
          </Typography>
          <Typography variant="body1">
            When the referred customer spends $25 on Linode services, and has
            remained an active customer in good standing for 90 days,
            you&rsquo;ll receive a $25 non-expiring account credit. There are no
            limits to the number of people you can refer.{' '}
            <Link to="https://www.linode.com/promotional-policy/">
              Read more about our promotions policy
            </Link>
            .
          </Typography>
        </Grid>
        <>
          <Grid size={12}>
            {allowReferral ? (
              <CopyableTextField
                expand
                label="Your personal referral link"
                value={url}
              />
            ) : null}
          </Grid>
          {allowReferral && total !== undefined && total > 0 ? (
            <StyledResultsWrapper>
              {pending !== undefined && pending > 0 ? (
                <StyledReferralGrid
                  container
                  justifyContent="space-between"
                  spacing={2}
                >
                  <Grid>Pending referrals</Grid>
                  <Grid>{pending}</Grid>
                </StyledReferralGrid>
              ) : null}
              <StyledReferralGrid
                container
                justifyContent="space-between"
                spacing={2}
              >
                <Grid>Completed referrals</Grid>
                <Grid>{completed}</Grid>
              </StyledReferralGrid>
              <StyledEarnedGrid
                container
                justifyContent="space-between"
                spacing={2}
              >
                <Grid>Credit earned</Grid>
                <Grid>${credit}</Grid>
              </StyledEarnedGrid>
            </StyledResultsWrapper>
          ) : null}
          {!allowReferral ? (
            <StyledLimitNotice
              spacingBottom={0}
              spacingTop={8}
              sx={{
                '&&': {
                  // '&&' is only needed because Notice is using makeStyles
                  padding: '8px',
                },
              }}
              variant="warning"
            >
              Spend $25 with Linode to activate your personal referral link
            </StyledLimitNotice>
          ) : null}
          <StyledImagesGridContainer
            container
            direction="row"
            justifyContent="space-between"
            sx={{
              padding: 0,
              width: '100%',
            }}
            wrap="nowrap"
          >
            <StyledImageGrid>
              <Step1 />
              <StyledImageCopy variant="body1">
                Share your referral link with friends and colleagues
              </StyledImageCopy>
            </StyledImageGrid>
            <StyledImageGrid>
              <Step2 />
              <StyledImageCopy variant="body1">
                They sign up and receive a $100, 60-day credit
              </StyledImageCopy>
            </StyledImageGrid>
            <StyledImageGrid>
              <Step3 />
              <StyledImageCopy variant="body1">
                You earn $25 after they make their first payment of $25
              </StyledImageCopy>
            </StyledImageGrid>
          </StyledImagesGridContainer>
        </>
      </Grid>
    </Paper>
  );
};

export const ReferralsLazyRoute = createLazyRoute('/profile/referrals')({
  component: Referrals,
});
