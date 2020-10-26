import { APIError } from '@linode/api-v4/lib/types';
import { pathOr } from 'ramda';
import * as React from 'react';
import { compose as recompose } from 'recompose';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ExpansionPanel from 'src/components/ExpansionPanel';
import Notice from 'src/components/Notice';
import PanelErrorBoundary from 'src/components/PanelErrorBoundary';
import PasswordInput from 'src/components/PasswordInput';
import SuspenseLoader from 'src/components/SuspenseLoader';
import TextField from 'src/components/TextField';
import useDatabases from 'src/hooks/useDatabases';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';

interface Props {
  databaseID: number;
  databaseLabel: string;
}

type CombinedProps = Props;

export const DatabaseSettingsPasswordPanel: React.FC<CombinedProps> = props => {
  const { databaseID, databaseLabel } = props;

  const { updateDatabase } = useDatabases();

  const [value, setValue] = React.useState<string>(databaseLabel);
  const [submitting, setSubmitting] = React.useState<boolean>(false);
  const [success, setSuccess] = React.useState<string | undefined>(undefined);
  const [errors, setErrors] = React.useState<APIError[] | undefined>();

  const hasErrorFor = getAPIErrorFor({}, errors);
  const passwordError = hasErrorFor('password');

  const genericError = hasErrorFor('none');

  const disabled = false;

  const changePassword = () => {};

  const handlePasswordChange = () => {};

  return (
    <ExpansionPanel
      heading="Reset Root Password"
      success={success}
      actions={() => (
        <ActionsPanel>
          <Button
            onClick={changePassword}
            buttonType="primary"
            disabled={disabled || submitting}
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
          error={Boolean(errors)}
          data-qa-password-input
          disabled={disabled}
          disabledReason={
            disabled
              ? "You don't have permissions to modify this Linode"
              : undefined
          }
        />
      </React.Suspense>
    </ExpansionPanel>
  );
};

const errorBoundary = PanelErrorBoundary({ heading: 'Database Label' });

export default recompose<CombinedProps, Props>(errorBoundary)(
  DatabaseSettingsPasswordPanel
);
