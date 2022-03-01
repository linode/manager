import { confirmTwoFactor } from '@linode/api-v4/lib/profile';
import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import CircleProgress from 'src/components/CircleProgress';
import Divider from 'src/components/core/Divider';
import Notice from 'src/components/Notice';
import { getAPIErrorOrDefault, getErrorMap } from 'src/utilities/errorUtils';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import ConfirmToken from './ConfirmToken';
import QRCodeForm from './QRCodeForm';

interface Props {
  loading: boolean;
  secret: string;
  username: string;
  twoFactorConfirmed: boolean;
  onSuccess: (scratchCode: string) => void;
  onCancel: () => void;
  toggleDialog: () => void;
}

type CombinedProps = Props;

export const EnableTwoFactorForm: React.FC<CombinedProps> = (props) => {
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
        <QRCodeForm
          secret={secret}
          secretLink={secretLink}
          updateFor={[secret, secretLink]}
        />
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
        updateFor={[token, tokenError, submitting]}
      />
    </React.Fragment>
  );
};

export default EnableTwoFactorForm;
