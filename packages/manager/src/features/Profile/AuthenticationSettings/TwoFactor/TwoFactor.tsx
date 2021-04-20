import { getTFAToken, Profile } from '@linode/api-v4/lib/profile';
import { APIError } from '@linode/api-v4/lib/types';
import { path } from 'ramda';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { compose } from 'recompose';
import FormControl from 'src/components/core/FormControl';
import FormControlLabel from 'src/components/core/FormControlLabel';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Notice from 'src/components/Notice';
import Toggle from 'src/components/Toggle';
import ToggleState from 'src/components/ToggleState';
import { requestProfile } from 'src/store/profile/profile.requests';
import { MapState } from 'src/store/types';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import DisableTwoFactorDialog from './DisableTwoFactorDialog';
import EnableTwoFactorForm from './EnableTwoFactorForm';
import ScratchDialog from './ScratchCodeDialog';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginBottom: theme.spacing(4),
  },
  container: {
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center',
    justifyContent: 'left',
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
  copy: {
    lineHeight: '20px',
    marginTop: theme.spacing(),
    marginBottom: theme.spacing(),
    maxWidth: 960,
  },
  button: {
    ...theme.applyLinkStyles,
  },
  disabled: {
    '& *': {
      color: theme.color.disabledText,
    },
  },
}));

interface Props {
  clearState: () => void;
  twoFactor?: boolean;
  username?: string;
  updateProfile: (profile: Partial<Profile>) => Promise<Profile>;
  disabled?: boolean;
}

type CombinedProps = Props & StateProps & DispatchProps;

export const TwoFactor: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();

  const { clearState, disabled, twoFactor, username } = props;

  const [errors, setErrors] = React.useState<APIError[] | undefined>(undefined);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [secret, setSecret] = React.useState<string>('');
  const [showQRCode, setShowQRCode] = React.useState<boolean>(false);
  const [success, setSuccess] = React.useState<string | undefined>(undefined);
  const [twoFactorEnabled, setTwoFactorEnabled] = React.useState<
    boolean | undefined
  >(props.twoFactor);
  const [twoFactorConfirmed, setTwoFactorConfirmed] = React.useState<
    boolean | undefined
  >(props.twoFactor);
  const [scratchCode, setScratchCode] = React.useState<string>('');

  React.useEffect(() => {
    clearState();
  }, [twoFactorEnabled, clearState]);

  React.useEffect(() => {
    setTwoFactorConfirmed(twoFactor);
  }, [twoFactor]);

  /**
   * success when TFA is enabled
   */
  const handleEnableSuccess = (scratchCode: string) => {
    /**
     * have redux re-request profile
     *
     * we need to do this because we just got a 200 from /profile/tfa
     * so we need to update the Redux profile state
     */
    props.refreshProfile();
    setSuccess('Two-factor authentication has been enabled.');
    setShowQRCode(false);
    setTwoFactorEnabled(true);
    setTwoFactorConfirmed(true);
    setScratchCode(scratchCode);
  };

  /**
   * success when TFA is disabled
   */
  const handleDisableSuccess = () => {
    /**
     * have redux re-request profile
     *
     * we need to do this because we just got a 200 from /profile/tfa
     * so we need to update the Redux profile state
     */
    props.refreshProfile();
    setSuccess('Two-factor authentication has been disabled.');
    setTwoFactorEnabled(false);
    setTwoFactorConfirmed(false);
  };

  const handleCancel = () => {
    if (twoFactorConfirmed) {
      toggleHidden();
    } else {
      toggleTwoFactorEnabled(false);
    }
  };

  const getToken = () => {
    setLoading(true);
    return getTFAToken()
      .then((response) => {
        setSecret(response.secret);
        setLoading(false);
        setErrors(undefined);
      })
      .catch((error) => {
        setErrors(
          getAPIErrorOrDefault(
            error,
            'There was an error retrieving your secret key. Please try again.'
          )
        );

        setLoading(false);
        scrollErrorIntoView();
        return Promise.reject('Error');
      });
  };

  const toggleHidden = () => {
    if (!showQRCode) {
      return getToken()
        .then((_) => setShowQRCode(!showQRCode))
        .catch((err) => err);
    }
    return setShowQRCode(!showQRCode);
  };

  const toggleTwoFactorEnabled = (toggleEnabled: boolean) => {
    setErrors(undefined);
    setSuccess(undefined);

    /* If we're turning TFA on, ask the API for a TFA secret */
    if (toggleEnabled) {
      return getToken()
        .then((_) => {
          setTwoFactorEnabled(true);
          setLoading(false);
          setShowQRCode(true);
        })
        .catch((err) => err);
    }
    setTwoFactorEnabled(false);
    return undefined;
  };

  const hasErrorFor = getAPIErrorFor({}, errors);
  const generalError = hasErrorFor('none');

  return (
    <ToggleState>
      {({ open: disable2FAOpen, toggle: toggleDisable2FA }) => (
        <ToggleState>
          {({ open: scratchDialogOpen, toggle: toggleScratchDialog }) => (
            <React.Fragment>
              <Paper
                className={`${classes.root} ${
                  disabled ? classes.disabled : ''
                }`}
              >
                {success && <Notice success text={success} />}
                {generalError && <Notice error text={generalError} />}
                <Typography variant="h3" data-qa-title>
                  Two-Factor Authentication (TFA)
                </Typography>
                <Typography
                  variant="body1"
                  className={classes.copy}
                  data-qa-copy
                >
                  Two-factor authentication increases the security of your
                  Linode account by requiring two different forms of
                  authentication to log in: your account password and a security
                  token. You can set up a third party app such as Authy or
                  Google Authenticator to generate these tokens for you.
                </Typography>
                {typeof twoFactorConfirmed !== 'undefined' && (
                  <TwoFactorToggle
                    twoFactorEnabled={twoFactorEnabled || false}
                    onChange={toggleTwoFactorEnabled}
                    toggleDisableDialog={toggleDisable2FA}
                    twoFactorConfirmed={twoFactorConfirmed}
                    disabled={disabled}
                  />
                )}
                {twoFactorEnabled && (
                  <div className={classes.container}>
                    <button
                      className={classes.button}
                      onClick={toggleHidden}
                      data-qa-hide-show-code
                    >
                      {showQRCode
                        ? 'Hide QR Code'
                        : twoFactorConfirmed
                        ? 'Reset two-factor authentication'
                        : 'Show QR Code'}
                    </button>
                  </div>
                )}
                {twoFactorEnabled &&
                  showQRCode &&
                  username &&
                  twoFactorConfirmed !== undefined && (
                    <EnableTwoFactorForm
                      secret={secret}
                      username={username}
                      loading={loading}
                      onSuccess={handleEnableSuccess}
                      onCancel={handleCancel}
                      twoFactorConfirmed={twoFactorConfirmed}
                      toggleDialog={toggleScratchDialog}
                    />
                  )}
              </Paper>
              <ScratchDialog
                open={scratchDialogOpen}
                closeDialog={toggleScratchDialog}
                scratchCode={scratchCode}
              />
              <DisableTwoFactorDialog
                onSuccess={handleDisableSuccess}
                open={disable2FAOpen}
                closeDialog={toggleDisable2FA}
              />
            </React.Fragment>
          )}
        </ToggleState>
      )}
    </ToggleState>
  );
};

interface StateProps {
  twoFactor?: boolean;
  username?: string;
}

const mapStateToProps: MapState<StateProps, {}> = (state) => ({
  twoFactor: path(['data', 'two_factor_auth'], state.__resources.profile),
  username: path(['data', 'username'], state.__resources.profile),
});

interface DispatchProps {
  refreshProfile: () => void;
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, Props> = (
  dispatch
) => ({
  refreshProfile: () => dispatch(requestProfile() as any),
});

const connected = connect(mapStateToProps, mapDispatchToProps);

export default compose<CombinedProps, Props>(connected)(TwoFactor);

interface ToggleProps {
  toggleDisableDialog: () => void;
  onChange: (value: boolean) => void;
  twoFactorEnabled: boolean;
  twoFactorConfirmed: boolean;
  disabled?: boolean;
}

const TwoFactorToggle: React.FC<ToggleProps> = (props) => {
  const { disabled, twoFactorEnabled } = props;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { twoFactorConfirmed, onChange } = props;
    const enabled = e.currentTarget.checked;
    /**
     * only open the disable dialog if 2FA has been turned on and we're flipping the toggle off
     */
    if (!enabled && twoFactorConfirmed) {
      props.toggleDisableDialog();
    } else {
      /** Otherwise flip the toggle. If toggling on, the parent will handle the API request. */
      onChange(enabled);
    }
  };

  return (
    <FormControl fullWidth>
      <FormControlLabel
        label={twoFactorEnabled ? 'Enabled' : 'Disabled'}
        control={
          <Toggle
            checked={twoFactorEnabled}
            onChange={handleChange}
            data-qa-toggle-tfa={twoFactorEnabled}
            disabled={disabled}
          />
        }
      />
    </FormControl>
  );
};
