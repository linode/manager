import { styled } from '@mui/material/styles';
import * as React from 'react';
import { useLocation } from 'react-router-dom';

import { CircleProgress } from 'src/components/CircleProgress';
import { Divider } from 'src/components/Divider';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { Link } from 'src/components/Link';
import { Paper } from 'src/components/Paper';
import { Typography } from 'src/components/Typography';
import { useProfile } from 'src/queries/profile';

import { PhoneVerification } from './PhoneVerification/PhoneVerification';
import { ResetPassword } from './ResetPassword';
import { SMSMessaging } from './SMSMessaging';
import { SecurityQuestions } from './SecurityQuestions/SecurityQuestions';
import { TPAProviders } from './TPAProviders';
import TrustedDevices from './TrustedDevices';
import { TwoFactor } from './TwoFactor/TwoFactor';

export const AuthenticationSettings = () => {
  const {
    data: profile,
    error: profileError,
    isLoading: profileLoading,
  } = useProfile();
  const authType = profile?.authentication_type ?? 'password';
  const twoFactor = Boolean(profile?.two_factor_auth);
  const username = profile?.username;
  const isThirdPartyAuthEnabled = authType !== 'password';

  const location = useLocation<{
    focusSecurityQuestions: boolean;
    focusTel: boolean;
  }>();
  const phoneNumberRef = React.createRef<HTMLInputElement>();
  const securityQuestionRef = React.createRef<HTMLInputElement>();

  React.useEffect(() => {
    if (!location.state) {
      return;
    }

    const { focusSecurityQuestions, focusTel } = location.state;
    const targetRef = focusTel
      ? phoneNumberRef
      : focusSecurityQuestions
      ? securityQuestionRef
      : null;

    const isValidTargetRef =
      targetRef &&
      targetRef.current &&
      !targetRef.current.getAttribute('data-scrolled');

    if (isValidTargetRef) {
      const currentTargetRef = targetRef.current;

      currentTargetRef.focus();

      setTimeout(() => {
        if (currentTargetRef) {
          currentTargetRef.scrollIntoView();
          currentTargetRef.setAttribute('data-scrolled', 'true');
        }
      }, 100);
    }
  }, [phoneNumberRef, securityQuestionRef, location.state]);

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
        <Divider spacingBottom={16} spacingTop={24} />
        {!isThirdPartyAuthEnabled ? (
          <>
            <ResetPassword username={username} />
            <Divider spacingBottom={16} spacingTop={22} />
            <TwoFactor twoFactor={twoFactor} username={username} />
            <Divider spacingBottom={16} spacingTop={22} />
          </>
        ) : null}
        <SecurityQuestions securityQuestionRef={securityQuestionRef} />
        <Divider spacingBottom={16} spacingTop={22} />
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
        <PhoneVerification phoneNumberRef={phoneNumberRef} />
        <Divider spacingBottom={16} spacingTop={22} />
        <Typography variant="h3">SMS Messaging</Typography>
        <SMSMessaging />
        {!isThirdPartyAuthEnabled ? (
          <>
            <Divider spacingBottom={16} spacingTop={22} />
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
  lineHeight: '20px',
  marginTop: theme.spacing(),
  maxWidth: 960,
}));
