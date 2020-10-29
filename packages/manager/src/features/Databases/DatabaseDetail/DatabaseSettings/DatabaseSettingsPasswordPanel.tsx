import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import { compose as recompose } from 'recompose';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ExpansionPanel from 'src/components/ExpansionPanel';
import Notice from 'src/components/Notice';
import PanelErrorBoundary from 'src/components/PanelErrorBoundary';
import PasswordInput from 'src/components/PasswordInput';
import SuspenseLoader from 'src/components/SuspenseLoader';
import useDatabases from 'src/hooks/useDatabases';
import { getErrorMap } from 'src/utilities/errorUtils';

interface Props {
  databaseID: number;
}

type CombinedProps = Props;

export const DatabaseSettingsPasswordPanel: React.FC<CombinedProps> = props => {
  const { databaseID } = props;

  const { resetPassword } = useDatabases();

  const [value, setValue] = React.useState<string>('');
  const [submitting, setSubmitting] = React.useState<boolean>(false);
  const [success, setSuccess] = React.useState<string | undefined>(undefined);
  const [errors, setErrors] = React.useState<APIError[] | undefined>();

  const errorMap = getErrorMap(['root_password'], errors);
  const passwordError = errorMap['root_password'];
  const genericError = errorMap.none;

  const changePassword = () => {
    setSubmitting(true);
    setSuccess(undefined);
    setErrors(undefined);

    resetPassword(databaseID, value)
      .then(() => {
        setSubmitting(false);
        setSuccess('Database password changed successfully.');
      })
      .catch(error => {
        setSubmitting(false);
        setErrors(error);
      });
  };

  const handlePasswordChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value);
    },
    []
  );

  return (
    <ExpansionPanel
      heading="Reset Root Password"
      success={success}
      actions={() => (
        <ActionsPanel>
          <Button
            onClick={changePassword}
            buttonType="primary"
            disabled={submitting}
            loading={submitting}
            data-qa-password-save
          >
            Save
          </Button>
        </ActionsPanel>
      )}
    >
      {genericError && <Notice error text={genericError} />}
      <React.Suspense fallback={<SuspenseLoader />}>
        <PasswordInput
          autoComplete="new-password"
          label="New Root Password"
          value={value}
          onChange={handlePasswordChange}
          errorText={passwordError}
          errorGroup="database-settings-password"
          error={Boolean(passwordError)}
          data-qa-password-input
        />
      </React.Suspense>
    </ExpansionPanel>
  );
};

const errorBoundary = PanelErrorBoundary({ heading: 'Reset Root Password' });

export default recompose<CombinedProps, Props>(errorBoundary)(
  DatabaseSettingsPasswordPanel
);
