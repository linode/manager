import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import { compose as recompose } from 'recompose';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Accordion from 'src/components/Accordion';
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
  const [open, setOpen] = React.useState<boolean>(false);
  const [submitting, setSubmitting] = React.useState<boolean>(false);
  const [success, setSuccess] = React.useState<string | undefined>(undefined);
  const [errors, setErrors] = React.useState<APIError[] | undefined>();

  React.useEffect(() => {
    if (open) {
      setSuccess('');
    }
  }, [open]);

  const errorMap = getErrorMap(['root_password'], errors);
  const passwordError = errorMap['root_password'];
  const genericError = errorMap.none;

  const changePassword = () => {
    setSubmitting(true);
    setSuccess(undefined);
    setErrors(undefined);

    resetPassword(databaseID, value)
      .then(() => {
        setValue('');
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
    <Accordion
      heading="Reset Root Password"
      expanded={open}
      onChange={() => {
        setOpen(!open);
      }}
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
    </Accordion>
  );
};

const errorBoundary = PanelErrorBoundary({ heading: 'Reset Root Password' });

export default recompose<CombinedProps, Props>(errorBoundary)(
  DatabaseSettingsPasswordPanel
);
