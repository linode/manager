import { Profile } from '@linode/api-v4/lib/profile';
import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import { useLocation } from 'react-router-dom';
import { compose } from 'recompose';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';
import useAccount from 'src/hooks/useAccount';
import useAccountManagement from 'src/hooks/useAccountManagement';
import useProfile from 'src/hooks/useProfile';
import withNotifications, {
  WithNotifications
} from 'src/store/notification/notification.containers';
import { getAPIErrorOrDefault, getErrorMap } from 'src/utilities/errorUtils';

type ClassNames = 'root' | 'title';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(3),
    paddingBottom: theme.spacing(3)
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

export const EmailChangeForm: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  const { updateAccount } = useAccount();
  const { updateProfile } = useProfile();
  const { account, profile } = useAccountManagement();

  const location = useLocation();

  const [profileSubmitting, setProfileSubmitting] = React.useState(false);
  const [profileErrors, setProfileErrors] = React.useState<
    APIError[] | undefined
  >();
  const [profileSuccess, setProfileSuccess] = React.useState('');

  const [accountSubmitting, setAccountSubmitting] = React.useState(false);
  const [accountErrors, setAccountErrors] = React.useState<
    APIError[] | undefined
  >();
  const [accountSuccess, setAccountSuccess] = React.useState('');

  const [username, setUsername] = React.useState(profile.data?.username);
  const [email, setEmail] = React.useState(profile.data?.email);

  const emailRef = React.createRef<HTMLInputElement>();

  React.useEffect(() => {
    if (location.state?.focusEmail && emailRef.current) {
      emailRef.current.focus();
      emailRef.current.scrollIntoView();
    }
  }, []);

  const onSubmitEmail = () => {
    setProfileSuccess('');
    setProfileErrors(undefined);
    setProfileSubmitting(true);

    updateProfile({ email })
      .then(() => {
        // If there's a "user_email_bounce" notification for this user, and
        // the user has just updated their email, re-request notifications to
        // potentially clear the email bounce notification.
        const hasUserEmailBounceNotification = props.notifications.find(
          thisNotification => thisNotification.type === 'user_email_bounce'
        );
        if (hasUserEmailBounceNotification) {
          props.requestNotifications();
        }

        setProfileSubmitting(false);
        setProfileSuccess('Email address updated.');
      })
      .catch(error => {
        setProfileSuccess('');
        setProfileSubmitting(false);
        setProfileErrors(
          getAPIErrorOrDefault(error, 'Error updating email address.')
        );
      });
  };

  const profileErrorMap = getErrorMap(['email'], profileErrors);
  const emailError = profileErrorMap.email;
  const generalProfileError = profileErrorMap.none;

  return (
    <Paper className={classes.root}>
      {profileSuccess && <Notice success text={profileSuccess} />}
      {generalProfileError && <Notice error text={generalProfileError} />}
      <TextField
        disabled
        label="Username"
        value={username}
        errorGroup="display-settings-email"
        data-qa-username
      />
      <TextField
        inputRef={emailRef}
        label="Email"
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        errorText={emailError}
        errorGroup="display-settings-email"
        data-qa-email
      />
      <ActionsPanel>
        <Button
          buttonType="primary"
          onClick={onSubmitEmail}
          loading={profileSubmitting}
          data-qa-submit
        >
          Save
        </Button>
      </ActionsPanel>
    </Paper>
  );
};

const enhanced = compose<CombinedProps, Props>(withNotifications());

export default enhanced(EmailChangeForm);
