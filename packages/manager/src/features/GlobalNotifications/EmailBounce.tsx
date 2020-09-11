import { useSnackbar } from 'notistack';
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import Button from 'src/components/Button';
import { makeStyles } from 'src/components/core/styles';
import { Theme } from 'src/components/core/styles/createMuiTheme';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import useAccount from 'src/hooks/useAccount';
import useNotifications from 'src/hooks/useNotifications';
import useProfile from 'src/hooks/useProfile';

// =============================================================================
// <EmailBounceNotificationSection />
// =============================================================================
export const EmailBounceNotificationSection: React.FC<{}> = React.memo(() => {
  const { account, updateAccount } = useAccount();
  const { profile, updateProfile } = useProfile();
  const notifications = useNotifications();
  const history = useHistory();

  // Have to use refs here, because these values should be static. I.e. if we
  // used the raw Redux values, when the user updated their email, the text of
  // this banner would change briefly before disappearing.
  const accountEmailRef = React.useRef(account.data?.email);
  const profileEmailRef = React.useRef(profile.data?.email);

  const billingEmailBounceNotification = notifications.find(
    thisNotification => thisNotification.type === 'billing_email_bounce'
  );

  const userEmailBounceNotification = notifications.find(
    thisNotification => thisNotification.type === 'user_email_bounce'
  );

  const confirmAccountEmail = () =>
    updateAccount({ email: accountEmailRef.current });
  const confirmProfileEmail = () =>
    updateProfile({ email: profileEmailRef.current });

  return (
    <>
      {billingEmailBounceNotification && accountEmailRef && (
        <EmailBounceNotification
          text={`An email to your account's email address couldn't be delivered. Is ${accountEmailRef.current} the correct address?`}
          confirmEmail={confirmAccountEmail}
          changeEmail={() =>
            history.push('/account', { contactDrawerOpen: true })
          }
        />
      )}
      {userEmailBounceNotification && profileEmailRef && (
        <EmailBounceNotification
          text={`An email to your user profile's email address couldn't be delivered. Is ${profileEmailRef.current} the correct address?`}
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
  updateButton: {
    marginLeft: 16,
    [theme.breakpoints.down('xs')]: {
      marginLeft: 0,
      marginTop: 12
    }
  },
  buttonContainer: {
    justifyContent: 'flex-end',
    [theme.breakpoints.down('sm')]: {
      marginTop: 8,
      marginBottom: 4,
      marginLeft: 2,
      justifyContent: 'flex-start'
    },
    [theme.breakpoints.down('xs')]: {
      flexDirection: 'column'
    }
  }
}));

interface Props {
  text: string;
  confirmEmail: () => Promise<any>;
  changeEmail: () => void;
}

type CombinedProps = Props;

const EmailBounceNotification: React.FC<CombinedProps> = React.memo(props => {
  const { text, confirmEmail, changeEmail } = props;

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

  if (dismissed) {
    return null;
  }

  return (
    <Notice
      important
      error
      spacing={2}
      text={
        <Grid container alignItems="center">
          <Grid item xs={12} md={6} lg={8}>
            <Typography>{text}</Typography>
          </Grid>
          <Grid
            container
            item
            xs={12}
            md={6}
            lg={4}
            className={classes.buttonContainer}
          >
            <Button
              buttonType="secondary"
              onClick={handleConfirm}
              loading={loading}
            >
              Yes, it&apos;s correct.
            </Button>
            <Button
              className={classes.updateButton}
              buttonType="primary"
              onClick={changeEmail}
            >
              No, let&apos;s update it
            </Button>
          </Grid>
        </Grid>
      }
    />
  );
});
