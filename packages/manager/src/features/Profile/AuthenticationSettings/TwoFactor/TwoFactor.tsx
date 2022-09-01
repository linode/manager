import { getTFAToken } from '@linode/api-v4/lib/profile';
import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import FormControl from 'src/components/core/FormControl';
import FormControlLabel from 'src/components/core/FormControlLabel';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Notice from 'src/components/Notice';
import Toggle from 'src/components/Toggle';
import ToggleState from 'src/components/ToggleState';
import { queryClient } from 'src/queries/base';
import { queryKey } from 'src/queries/profile';
import { useSecurityQuestions } from 'src/queries/securityQuestions';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';
import DisableTwoFactorDialog from './DisableTwoFactorDialog';
import EnableTwoFactorForm from './EnableTwoFactorForm';
import ScratchDialog from './ScratchCodeDialog';

const useStyles = makeStyles((theme: Theme) => ({
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
  username?: string;
  twoFactor?: boolean;
  clearState: () => void;
  disabled?: boolean;
}

export const TwoFactor: React.FC<Props> = (props) => {
  const classes = useStyles();

  const needSecurityQuestionsCopy =
    'To use two-factor authentication you must set up your security questions listed below.';

  const { clearState, disabled, twoFactor, username } = props;

  const [errors, setErrors] = React.useState<APIError[] | undefined>(undefined);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [secret, setSecret] = React.useState<string>('');
  const [showQRCode, setShowQRCode] = React.useState<boolean>(false);
  const [success, setSuccess] = React.useState<string | undefined>(undefined);
  const [twoFactorEnabled, setTwoFactorEnabled] = React.useState<
    boolean | undefined
  >(twoFactor);
  const [twoFactorConfirmed, setTwoFactorConfirmed] = React.useState<
    boolean | undefined
  >(twoFactor);
  const [scratchCode, setScratchCode] = React.useState<string>('');

  const { data: securityQuestionsData } = useSecurityQuestions();

  const hasSecurityQuestions =
    securityQuestionsData?.security_questions.filter(
      (question) => question.response
    ).length === 3;

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
    // Refetch Profile with React Query so profile is up to date
    queryClient.invalidateQueries(queryKey);
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
    // Refetch Profile with React Query so profile is up to date
    queryClient.invalidateQueries(queryKey);
    setErrors(undefined);
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
    if (!hasSecurityQuestions) {
      setErrors([
        {
          reason: `You must add Security Questions to your profile in order to ${
            twoFactor ? 'reset' : 'enable'
          } Two-Factor Authentication`,
        },
      ]);
      return Promise.reject('Error');
    }

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
              <div className={disabled ? classes.disabled : undefined}>
                <Typography variant="h3" data-qa-title>
                  Two-Factor Authentication (2FA)
                </Typography>
                {success && (
                  <Notice
                    spacingTop={16}
                    spacingBottom={16}
                    success
                    text={success}
                  />
                )}
                {generalError && (
                  <Notice
                    spacingTop={16}
                    spacingBottom={16}
                    error
                    text={generalError}
                  />
                )}
                <Typography
                  variant="body1"
                  className={classes.copy}
                  data-qa-copy
                >
                  Two-factor authentication increases the security of your
                  Linode account by requiring two different forms of
                  authentication to log in: your Linode account password and an
                  authorized security token generated by another platform.
                </Typography>
                {(hasSecurityQuestions && !twoFactor) || twoFactor ? (
                  typeof twoFactorConfirmed !== 'undefined' && (
                    <TwoFactorToggle
                      twoFactorEnabled={twoFactorEnabled || false}
                      onChange={toggleTwoFactorEnabled}
                      toggleDisableDialog={toggleDisable2FA}
                      twoFactorConfirmed={twoFactorConfirmed}
                      disabled={disabled}
                    />
                  )
                ) : (
                  <Notice
                    warning
                    text={needSecurityQuestionsCopy}
                    style={{ marginTop: '8px' }}
                    typeProps={{ style: { fontSize: '0.875rem' } }}
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
              </div>
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

export default TwoFactor;

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
    <FormControl fullWidth style={{ marginTop: 0 }}>
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
