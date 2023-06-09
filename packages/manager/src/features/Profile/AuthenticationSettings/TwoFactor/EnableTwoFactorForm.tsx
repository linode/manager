import * as React from 'react';
import Divider from 'src/components/core/Divider';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import { APIError } from '@linode/api-v4/lib/types';
import { CircleProgress } from 'src/components/CircleProgress';
import { ConfirmToken } from './ConfirmToken';
import { confirmTwoFactor } from '@linode/api-v4/lib/profile';
import { getAPIErrorOrDefault, getErrorMap } from 'src/utilities/errorUtils';
import { Notice } from 'src/components/Notice/Notice';
import { QRCodeForm } from './QRCodeForm';

interface Props {
  loading: boolean;
  onCancel: () => void;
  onSuccess: (scratchCode: string) => void;
  secret: string;
  toggleDialog: () => void;
  twoFactorConfirmed: boolean;
  username: string;
}

export const EnableTwoFactorForm = (props: Props) => {
  const [errors, setErrors] = React.useState<APIError[] | undefined>(undefined);
  const [submitting, setSubmitting] = React.useState<boolean>(false);
  const [token, setToken] = React.useState<string>('');

  const getSecretLink = () => {
    const { secret, username } = props;
    const issuer = 'Linode';
    return `otpauth://totp/${issuer}%3A${username}?secret=${secret}&issuer=${issuer}`;
  };

  const handleTokenInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setToken(e.target.value);
  };

  const onSubmit = () => {
    const safeToken = token.replace(/ /g, '');
    setSubmitting(true);
    confirmTwoFactor(safeToken)
      .then((response) => {
        setErrors(undefined);
        setSubmitting(false);
        setToken('');
        props.onSuccess(response.scratch);

        /* Toggle the scratch code dialog */
        props.toggleDialog();
      })
      .catch((error) => {
        let APIErrors = getAPIErrorOrDefault(
          error,
          'Could not confirm code.',
          'tfa_code'
        );
        APIErrors = APIErrors.filter((err: APIError) => {
          // Filter potentially confusing API error
          return (
            err.reason !==
            'Invalid token. Two-factor auth not enabled. Please try again.'
          );
        });

        setErrors(APIErrors);
        setSubmitting(false);
        setToken('');
        scrollErrorIntoView();
      });
  };

  const { loading, secret, twoFactorConfirmed } = props;
  const secretLink = getSecretLink();
  const hasErrorFor = getErrorMap(['tfa_code'], errors);
  const tokenError = hasErrorFor.tfa_code;
  const generalError = hasErrorFor.none;

  return (
    <React.Fragment>
      {generalError && <Notice error text={generalError} />}
      {loading ? (
        <CircleProgress />
      ) : (
        <QRCodeForm secret={secret} secretLink={secretLink} />
      )}
      <Divider spacingTop={44} spacingBottom={20} />
      <ConfirmToken
        error={tokenError}
        token={token}
        submitting={submitting}
        twoFactorConfirmed={twoFactorConfirmed}
        handleChange={handleTokenInputChange}
        onCancel={props.onCancel}
        onSubmit={onSubmit}
      />
    </React.Fragment>
  );
};
