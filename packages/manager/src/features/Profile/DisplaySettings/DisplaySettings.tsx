import { updateUser } from '@linode/api-v4/lib/account';
import * as React from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { compose } from 'recompose';
import UserIcon from 'src/assets/icons/account.svg';
import Box from 'src/components/core/Box';
import Divider from 'src/components/core/Divider';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import ExternalLink from 'src/components/ExternalLink';
import HelpIcon from 'src/components/HelpIcon';
import Link from 'src/components/Link';
import Notice from 'src/components/Notice';
import { SingleTextFieldForm } from 'src/components/SingleTextFieldForm/SingleTextFieldForm';
import { useAccountGravatar } from 'src/queries/account';
import { useMutateProfile, useProfile } from 'src/queries/profile';
import { ApplicationState } from 'src/store';
import withNotifications, {
  WithNotifications,
} from 'src/store/notification/notification.containers';
import { v4 } from 'uuid';
import TimezoneForm from './TimezoneForm';

const useStyles = makeStyles((theme: Theme) => ({
  profile: {
    marginTop: theme.spacing(),
    marginBottom: theme.spacing(4),
  },
  profileTitle: {
    fontSize: '1rem',
  },
  profileCopy: {
    marginTop: 4,
    marginBottom: theme.spacing(2),
    maxWidth: 360,
  },
  avatar: {
    borderRadius: '50%',
    marginRight: 28,
    '& svg': {
      color: '#c9c7c7',
      height: 88,
      width: 88,
    },
  },
  gravatar: {
    borderRadius: '50%',
    height: 88,
    width: 88,
  },
  helpIcon: {
    marginTop: -2,
    marginLeft: 6,
    padding: 0,
  },
  tooltip: {
    '& .MuiTooltip-tooltip': {
      minWidth: 350,
    },
  },
  addImageLink: {
    fontFamily: theme.font.bold,
    fontSize: '1rem',
    '& svg': {
      height: '1rem',
      width: '1rem',
      position: 'relative',
      top: 3,
      left: 6,
    },
  },
}));

export const DisplaySettings: React.FC<WithNotifications> = (props) => {
  const classes = useStyles();

  const { mutateAsync: updateProfile } = useMutateProfile();
  const { data: profile, refetch: requestProfile } = useProfile();

  const {
    data: gravatarURL,
    error: gravatarError,
    isLoading: gravatarLoading,
  } = useAccountGravatar(profile?.email ?? '');

  const noGravatar =
    gravatarLoading || gravatarError || gravatarURL === 'not found';

  const loggedInAsCustomer = useSelector(
    (state: ApplicationState) => state.authentication.loggedInAsCustomer
  );
  const location = useLocation<{ focusEmail: boolean }>();

  const emailRef = React.createRef<HTMLInputElement>();

  React.useEffect(() => {
    if (location.state?.focusEmail && emailRef.current) {
      emailRef.current.focus();
      emailRef.current.scrollIntoView();
    }
  }, [emailRef, location.state]);

  // Used as React keys to force-rerender forms.
  const [emailResetToken, setEmailResetToken] = React.useState(v4());
  const [usernameResetToken, setUsernameResetToken] = React.useState(v4());

  const updateUsername = (newUsername: string) => {
    setEmailResetToken(v4());
    // Default to empty string... but I don't believe this is possible.
    return updateUser(profile?.username ?? '', {
      username: newUsername,
    });
  };

  const updateEmail = (newEmail: string) => {
    setUsernameResetToken(v4());
    return updateProfile({ email: newEmail });
  };

  const helpIconText = (
    <>
      Go to <Link to="https://en.gravatar.com/">gravatar.com</Link> and register
      an account using the same email address as your Linode account. Upload
      your desired profile image to your Gravatar account and it will be
      automatically linked.
    </>
  );

  return (
    <Paper>
      {gravatarError ? (
        <Notice warning text={'Error retrieving Gravatar'} />
      ) : null}
      <Box className={classes.profile} display="flex">
        {noGravatar ? (
          <div className={classes.avatar}>
            <UserIcon />
          </div>
        ) : (
          <div className={classes.avatar}>
            <img
              className={classes.gravatar}
              src={gravatarURL}
              alt="Gravatar"
            />
          </div>
        )}
        <div>
          <Typography className={classes.profileTitle} variant="h2">
            Profile photo
            {noGravatar ? (
              <HelpIcon
                classes={{ popper: classes.tooltip }}
                className={classes.helpIcon}
                interactive
                text={helpIconText}
              />
            ) : null}
          </Typography>
          <Typography className={classes.profileCopy} variant="body1">
            {noGravatar
              ? 'Create, upload, and manage your globally recognized avatar from a single place with Gravatar.'
              : 'Edit your profile photo using Gravatar.'}
          </Typography>
          <ExternalLink
            className={classes.addImageLink}
            link="https://en.gravatar.com/"
            text={noGravatar ? 'Add photo' : 'Edit photo'}
            fixedIcon
          />
        </div>
      </Box>
      <Divider />
      <SingleTextFieldForm
        key={usernameResetToken}
        label="Username"
        submitForm={updateUsername}
        initialValue={profile?.username}
        disabled={profile?.restricted}
        tooltipText={
          profile?.restricted
            ? 'Restricted users cannot update their username. Please contact an account administrator.'
            : undefined
        }
        successCallback={requestProfile}
      />
      <Divider spacingTop={24} />
      <SingleTextFieldForm
        key={emailResetToken}
        label="Email"
        submitForm={updateEmail}
        initialValue={profile?.email}
        successCallback={() => {
          // If there's a "user_email_bounce" notification for this user, and
          // the user has just updated their email, re-request notifications to
          // potentially clear the email bounce notification.
          const hasUserEmailBounceNotification = props.notifications.find(
            (thisNotification) => thisNotification.type === 'user_email_bounce'
          );
          if (hasUserEmailBounceNotification) {
            props.requestNotifications();
          }
        }}
        inputRef={emailRef}
        type="email"
      />
      <Divider spacingTop={24} spacingBottom={16} />
      <TimezoneForm loggedInAsCustomer={loggedInAsCustomer} />
    </Paper>
  );
};

const enhanced = compose<WithNotifications, {}>(withNotifications());

export default enhanced(DisplaySettings);
