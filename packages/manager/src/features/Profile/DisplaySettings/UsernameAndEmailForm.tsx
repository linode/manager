import { updateUser } from '@linode/api-v4/lib/account';
import { Profile } from '@linode/api-v4/lib/profile';
import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import { useLocation } from 'react-router-dom';
import { compose } from 'recompose';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import { SingleTextFieldForm } from 'src/components/SingleTextFieldForm/SingleTextFieldForm';
import useAccountManagement from 'src/hooks/useAccountManagement';
import useProfile from 'src/hooks/useProfile';
import withNotifications, {
  WithNotifications
} from 'src/store/notification/notification.containers';

const useStyles = makeStyles((theme: Theme) => ({
  paper: {
    padding: theme.spacing(3),
    paddingBottom: theme.spacing(3),
    marginBottom: theme.spacing(3)
  },
  title: {
    marginBottom: theme.spacing(2)
  }
}));

interface Props {
  username: string;
  email: string;
  updateProfile: (v: Partial<Profile>) => Promise<Profile>;
  errors?: APIError[];
}

type CombinedProps = Props & WithNotifications;

export const UsernameAndEmailForm: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  const { updateProfile, requestProfile } = useProfile();
  const { profile, _isRestrictedUser } = useAccountManagement();

  const location = useLocation();

  const emailRef = React.createRef<HTMLInputElement>();

  React.useEffect(() => {
    if (location.state?.focusEmail && emailRef.current) {
      emailRef.current.focus();
      emailRef.current.scrollIntoView();
    }
  }, [emailRef, location.state]);

  if (!profile.data?.username) {
    return null;
  }

  const updateUsername = (newUsername: string) =>
    updateUser(profile?.data?.username ?? '', {
      username: newUsername
    });

  const updateEmail = (newEmail: string) => updateProfile({ email: newEmail });

  return (
    <>
      <Paper className={classes.paper}>
        <SingleTextFieldForm
          label="Username"
          submitForm={updateUsername}
          initialValue={profile.data.username}
          disabled={_isRestrictedUser}
          tooltipText={
            _isRestrictedUser
              ? 'Restricted users cannot update their username. Please contact an account administrator.'
              : undefined
          }
          cb={requestProfile}
        />
      </Paper>

      <Paper className={classes.paper}>
        <SingleTextFieldForm
          label="Email"
          submitForm={updateEmail}
          initialValue={profile.data.email}
          cb={() => {
            // If there's a "user_email_bounce" notification for this user, and
            // the user has just updated their email, re-request notifications to
            // potentially clear the email bounce notification.
            const hasUserEmailBounceNotification = props.notifications.find(
              thisNotification => thisNotification.type === 'user_email_bounce'
            );
            if (hasUserEmailBounceNotification) {
              props.requestNotifications();
            }
          }}
          inputRef={emailRef}
          type="email"
        />
      </Paper>
    </>
  );
};

const enhanced = compose<CombinedProps, Props>(withNotifications());

export default enhanced(UsernameAndEmailForm);
