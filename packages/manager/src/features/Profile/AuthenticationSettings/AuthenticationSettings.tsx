import { useProfile } from '@linode/queries';
import {
  CircleProgress,
  Divider,
  ErrorState,
  Paper,
  Typography,
} from '@linode/ui';
import { styled } from '@mui/material/styles';
import { useSearch } from '@tanstack/react-router';
import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { Link } from 'src/components/Link';

import { PhoneVerification } from './PhoneVerification/PhoneVerification';
import { ResetPassword } from './ResetPassword';
import { SecurityQuestions } from './SecurityQuestions/SecurityQuestions';
import { SMSMessaging } from './SMSMessaging';
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
  const { focusSecurityQuestions, focusTel } = useSearch({
    strict: false,
  });

  const phoneNumberRef = React.createRef<HTMLInputElement>();
  const securityQuestionRef = React.createRef<HTMLInputElement>();

  React.useEffect(() => {
    if (!focusSecurityQuestions && !focusTel) {
      return;
    }

    // Determine the target ref based on the location state values
    const targetRef = focusTel
      ? phoneNumberRef
      : focusSecurityQuestions
        ? securityQuestionRef
        : null;

    if (
      targetRef &&
      targetRef.current &&
      !targetRef.current.getAttribute('data-scrolled')
    ) {
      const currentTargetRef = targetRef.current;

      currentTargetRef.focus();

      // Using a short timeout here to ensure the element
      // is in the DOM before scrolling
      // TODO: Look into mutation observer to remove the need for this timeout
      setTimeout(() => {
        if (currentTargetRef) {
          currentTargetRef.scrollIntoView();
          currentTargetRef.setAttribute('data-scrolled', 'true');
        }
      }, 100);
    }
  }, [phoneNumberRef, securityQuestionRef, focusSecurityQuestions, focusTel]);

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
          <Link to="https://techdocs.akamai.com/cloud-computing/docs/security-controls-for-user-accounts#phone-verification">
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
