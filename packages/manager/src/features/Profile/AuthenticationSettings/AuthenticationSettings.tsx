import * as React from 'react';
import Divider from 'src/components/core/Divider';
import Link from 'src/components/Link';
import Paper from 'src/components/core/Paper';
import TrustedDevices from './TrustedDevices';
import Typography from 'src/components/core/Typography';
import { CircleProgress } from 'src/components/CircleProgress';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { PhoneVerification } from './PhoneVerification/PhoneVerification';
import { ResetPassword } from './ResetPassword';
import { SecurityQuestions } from './SecurityQuestions/SecurityQuestions';
import { SMSMessaging } from './SMSMessaging';
import { styled } from '@mui/material/styles';
import { TPAProviders } from './TPAProviders';
import { TwoFactor } from './TwoFactor/TwoFactor';
import { useProfile } from 'src/queries/profile';

export const AuthenticationSettings = () => {
  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
  } = useProfile();
  const authType = profile?.authentication_type ?? 'password';
  const twoFactor = Boolean(profile?.two_factor_auth);
  const username = profile?.username;
  const isThirdPartyAuthEnabled = authType !== 'password';

  if (profileError) {
    return <ErrorState errorText="Unable to load your profile" />;
  }

  if (profileLoading) {
    return <CircleProgress />;
  }

  return (
    <>
      <DocumentTitleSegment segment="Login & Authentication" />
      <TPAProviders authType={authType} />
      <StyledRootContainer>
        <StyledSecuritySettingsCopy variant="h3">
          Security Settings
        </StyledSecuritySettingsCopy>
        <Divider spacingTop={24} spacingBottom={16} />
        {!isThirdPartyAuthEnabled ? (
          <>
            <ResetPassword username={username} />
            <Divider spacingTop={22} spacingBottom={16} />
            <TwoFactor twoFactor={twoFactor} username={username} />
            <Divider spacingTop={22} spacingBottom={16} />
          </>
        ) : null}
        <SecurityQuestions />
        <Divider spacingTop={22} spacingBottom={16} />
        <Typography variant="h3">Phone Verification</Typography>
        <StyledMainCopy variant="body1">
          A verified phone number provides our team with a secure method of
          verifying your identity as the owner of your Cloud Manager user
          account. This phone number is only ever used to send an SMS message
          with a verification code. Standard carrier messaging fees may apply.
          By clicking Send Verification Code you are opting in to receive SMS
          messages. You may opt out at any time.{' '}
          <Link to="https://www.linode.com/docs/guides/user-security-controls#phone-verification">
            Learn more about security options.
          </Link>
        </StyledMainCopy>
        <PhoneVerification />
        <Divider spacingTop={22} spacingBottom={16} />
        <Typography variant="h3">SMS Messaging</Typography>
        <SMSMessaging />
        {!isThirdPartyAuthEnabled ? (
          <>
            <Divider spacingTop={22} spacingBottom={16} />
            <TrustedDevices />
          </>
        ) : null}
      </StyledRootContainer>
    </>
  );
};

export const StyledRootContainer = styled(Paper, {
  label: 'StyledRootContainer',
})(({ theme }) => ({
  marginBottom: theme.spacing(3),
  padding: theme.spacing(3),
  paddingTop: 17,
}));

export const StyledSecuritySettingsCopy = styled(Typography, {
  label: 'StyledSecuritySettingsCopy',
})(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

export const StyledMainCopy = styled(Typography, {
  label: 'StyledMainCopy',
})(({ theme }) => ({
  maxWidth: 960,
  lineHeight: '20px',
  marginTop: theme.spacing(),
}));
