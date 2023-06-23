import { useSnackbar } from 'notistack';
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import Button from 'src/components/Button';
import { makeStyles, useTheme } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Typography from 'src/components/core/Typography';
import Grid from '@mui/material/Unstable_Grid2';
import { Notice } from 'src/components/Notice/Notice';
import { useAccount, useMutateAccount } from 'src/queries/account';
import { useMutateProfile, useProfile } from 'src/queries/profile';
import { useNotificationsQuery } from 'src/queries/accountNotifications';

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
          text={
            <Typography data-testid="billing_email_bounce">
              An email to your account&rsquo;s email address couldn&rsquo;t be
              delivered. Is <strong>{accountEmailRef.current}</strong> the
              correct address?
            </Typography>
          }
          confirmEmail={confirmAccountEmail}
          changeEmail={() =>
            history.push('/account', {
              contactDrawerOpen: true,
              focusEmail: true,
            })
          }
        />
      )}
      {userEmailBounceNotification && profileEmailRef && (
        <EmailBounceNotification
          text={
            <Typography data-testid="user_email_bounce">
              An email to your user profile&rsquo;s email address couldn&rsquo;t
              be delivered. Is <strong>{profileEmailRef.current}</strong> the
              correct address?
            </Typography>
          }
          confirmEmail={confirmProfileEmail}
          changeEmail={() =>
            history.push('/profile/display', { focusEmail: true })
          }
        />
      )}
    </>
  );
});

// =============================================================================
// <EmailBounceNotification />
// =============================================================================
const useEmailBounceNotificationStyles = makeStyles((theme: Theme) => ({
  buttonContainer: {
    justifyContent: 'flex-end',
    [theme.breakpoints.down('md')]: {
      justifyContent: 'flex-start',
      marginBottom: 4,
      marginLeft: 2,
      marginTop: 8,
    },
  },
  updateButton: {
    marginLeft: 16,
  },
}));

interface Props {
  text: React.ReactNode;
  confirmEmail: () => Promise<any>;
  changeEmail: () => void;
}

const EmailBounceNotification = React.memo((props: Props) => {
  const { changeEmail, confirmEmail, text } = props;

  const classes = useEmailBounceNotificationStyles();

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
    <Notice important warning spacing={2}>
      <Grid container alignItems="center">
        <Grid xs={12} md={6} lg={8}>
          {text}
        </Grid>
        <Grid
          container
          xs={12}
          md={6}
          lg={4}
          className={classes.buttonContainer}
        >
          <Button
            buttonType="primary"
            onClick={handleConfirm}
            loading={loading}
            data-testid="confirmButton"
          >
            {confirmationText}
          </Button>
          <Button
            className={classes.updateButton}
            buttonType="secondary"
            onClick={changeEmail}
            data-testid="updateButton"
          >
            {updateText}
          </Button>
        </Grid>
      </Grid>
    </Notice>
  );
});
