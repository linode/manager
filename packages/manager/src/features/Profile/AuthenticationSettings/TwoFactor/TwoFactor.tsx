import * as React from 'react';
import DisableTwoFactorDialog from './DisableTwoFactorDialog';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';
import ScratchDialog from './ScratchCodeDialog';
import Typography from 'src/components/core/Typography';
import { APIError } from '@linode/api-v4/lib/types';
import { EnableTwoFactorForm } from './EnableTwoFactorForm';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { getTFAToken } from '@linode/api-v4/lib/profile';
import { Notice } from 'src/components/Notice/Notice';
import { queryKey } from 'src/queries/profile';
import { LinkStyledButton } from 'src/components/Button/LinkStyledButton';
import { TwoFactorToggle } from './TwoFactorToggle';
import { useQueryClient } from 'react-query';
import { useSecurityQuestions } from 'src/queries/securityQuestions';
import {
  StyledCTAWrapper,
  StyledCopy,
  StyledRootContainer,
} from './TwoFactor.styles';

export interface TwoFactorProps {
  disabled?: boolean;
  twoFactor?: boolean;
  username?: string;
}

export const TwoFactor = (props: TwoFactorProps) => {
  const needSecurityQuestionsCopy =
    'To use two-factor authentication you must set up your security questions listed below.';
  const { disabled, twoFactor, username } = props;
  const queryClient = useQueryClient();
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

  const [disable2FAOpen, setDisable2FAOpen] = React.useState(false);
  const [scratchDialogOpen, setScratchDialogOpen] = React.useState(false);

  const toggleDisable2FA = () => {
    setDisable2FAOpen((prev) => !prev);
  };

  const toggleScratchDialog = () => {
    setScratchDialogOpen((prev) => !prev);
  };

  return (
    <React.Fragment>
      <StyledRootContainer {...props}>
        <Typography variant="h3" data-qa-title>
          Two-Factor Authentication (2FA)
        </Typography>
        {success && (
          <Notice spacingTop={16} spacingBottom={16} success text={success} />
        )}
        {generalError && (
          <Notice
            spacingTop={16}
            spacingBottom={16}
            error
            text={generalError}
          />
        )}
        <StyledCopy variant="body1" data-qa-copy>
          Two-factor authentication increases the security of your Cloud Manager
          account by requiring two different forms of authentication to log in:
          your Cloud Manager account password and an authorized security token
          generated by another platform.
        </StyledCopy>
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
          <StyledCTAWrapper>
            <LinkStyledButton onClick={toggleHidden} data-qa-hide-show-code>
              {showQRCode
                ? 'Hide QR Code'
                : twoFactorConfirmed
                ? 'Reset two-factor authentication'
                : 'Show QR Code'}
            </LinkStyledButton>
          </StyledCTAWrapper>
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
      </StyledRootContainer>
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
  );
};
