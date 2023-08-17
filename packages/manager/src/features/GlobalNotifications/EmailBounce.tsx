import Grid from '@mui/material/Unstable_Grid2';
import { useTheme, Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { Button } from 'src/components/Button/Button';
import { Notice } from 'src/components/Notice/Notice';
import { Typography } from 'src/components/Typography';
import { useAccount, useMutateAccount } from 'src/queries/account';
import { useNotificationsQuery } from 'src/queries/accountNotifications';
import { useMutateProfile, useProfile } from 'src/queries/profile';
import { StyledButton, StyledGrid } from './EmailBounce.styles';

// =============================================================================
// <EmailBounceNotificationSection />
// =============================================================================
export const EmailBounceNotificationSection = React.memo(() => {
  const { data: account } = useAccount();
  const { mutateAsync: updateAccount } = useMutateAccount();
  const { data: profile } = useProfile();
  const { mutateAsync: updateProfile } = useMutateProfile();
  const { data: notifications } = useNotificationsQuery();
  const history = useHistory();

  // Have to use refs here, because these values should be static. I.e. if we
  // used the raw Redux values, when the user updated their email, the text of
  // this banner would change briefly before disappearing.
  const accountEmailRef = React.useRef(account?.email);
  const profileEmailRef = React.useRef(profile?.email);

  const billingEmailBounceNotification = notifications?.find(
    (thisNotification) => thisNotification.type === 'billing_email_bounce'
  );

  const userEmailBounceNotification = notifications?.find(
    (thisNotification) => thisNotification.type === 'user_email_bounce'
  );

  const confirmAccountEmail = () =>
    updateAccount({ email: accountEmailRef.current });
  const confirmProfileEmail = () =>
    updateProfile({ email: profileEmailRef.current });

  return (
    <>
      {billingEmailBounceNotification && accountEmailRef && (
        <EmailBounceNotification
          changeEmail={() =>
            history.push('/account', {
              contactDrawerOpen: true,
              focusEmail: true,
            })
          }
          text={
            <Typography data-testid="billing_email_bounce">
              An email to your account&rsquo;s email address couldn&rsquo;t be
              delivered. Is <strong>{accountEmailRef.current}</strong> the
              correct address?
            </Typography>
          }
          confirmEmail={confirmAccountEmail}
        />
      )}
      {userEmailBounceNotification && profileEmailRef && (
        <EmailBounceNotification
          changeEmail={() =>
            history.push('/profile/display', { focusEmail: true })
          }
          text={
            <Typography data-testid="user_email_bounce">
              An email to your user profile&rsquo;s email address couldn&rsquo;t
              be delivered. Is <strong>{profileEmailRef.current}</strong> the
              correct address?
            </Typography>
          }
          confirmEmail={confirmProfileEmail}
        />
      )}
    </>
  );
});

// =============================================================================
// <EmailBounceNotification />
// =============================================================================

interface Props {
  changeEmail: () => void;
  confirmEmail: () => Promise<any>;
  text: React.ReactNode;
}

const EmailBounceNotification = React.memo((props: Props) => {
  const { changeEmail, confirmEmail, text } = props;

  const { enqueueSnackbar } = useSnackbar();

  const [dismissed, setDismissed] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleConfirm = () => {
    setLoading(true);
    confirmEmail()
      .then(() => {
        setLoading(false);
        setDismissed(true);
        enqueueSnackbar('Email confirmed', { variant: 'success' });
      })
      .catch(() => {
        setLoading(false);
        enqueueSnackbar('Error confirming email', { variant: 'error' });
      });
  };

  const theme = useTheme<Theme>();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('md'));

  const confirmationText = matchesSmDown
    ? 'Confirm'
    : 'Yes it\u{2019}s correct.';
  const updateText = matchesSmDown ? 'Update' : 'No, let\u{2019}s update it.';

  if (dismissed) {
    return null;
  }

  return (
    <Notice important spacing={2} warning>
      <Grid alignItems="center" container>
        <Grid lg={8} md={6} xs={12}>
          {text}
        </Grid>
        <StyledGrid container lg={4} md={6} xs={12}>
          <Button
            buttonType="primary"
            data-testid="confirmButton"
            loading={loading}
            onClick={handleConfirm}
          >
            {confirmationText}
          </Button>
          <StyledButton
            buttonType="secondary"
            data-testid="updateButton"
            onClick={changeEmail}
          >
            {updateText}
          </StyledButton>
        </StyledGrid>
      </Grid>
    </Notice>
  );
});
