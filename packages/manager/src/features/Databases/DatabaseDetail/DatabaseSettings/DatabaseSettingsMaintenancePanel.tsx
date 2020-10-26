import { APIError } from '@linode/api-v4/lib/types';
import { lensPath, pathOr, set } from 'ramda';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ExpansionPanel from 'src/components/ExpansionPanel';
import Notice from 'src/components/Notice';
import PanelErrorBoundary from 'src/components/PanelErrorBoundary';
import TextField from 'src/components/TextField';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';

interface Props {
  databaseID: number;
  databaseLabel: string;
}

type CombinedProps = Props;

export const DatabaseSettingsMaintenancePanel: React.FC<CombinedProps> = props => {
  const { databaseID, databaseLabel } = props;

  const [updatedValue, setUpdatedValue] = React.useState<string>(databaseLabel);
  const [success, setSuccess] = React.useState<string | undefined>(undefined);
  const [errors, setErrors] = React.useState<APIError[] | undefined>();

  const hasErrorFor = getAPIErrorFor({}, errors);
  const labelError = hasErrorFor('label');

  const genericError =
    errors &&
    !labelError &&
    pathOr('An error occured while updating label', [0, 'reason'], errors);

  // const disabled = permissions === 'read_only';

  const changePassword = () => {};

  return (
    <ExpansionPanel
      heading="Change Maintenance Window"
      success={success}
      actions={() => (
        <ActionsPanel>
          <Button
            onClick={changePassword}
            buttonType="primary"
            disabled={}
            loading={}
            data-qa-label-save
          >
            Save
          </Button>
        </ActionsPanel>
      )}
    >
      {genericError && <Notice error text={genericError} />}
      <TextField
        label="Label"
        value={updatedValue}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setUpdatedValue(set(lensPath(['updatedValue']), e.target.value))
        }
        errorText={labelError}
        errorGroup="linode-settings-label"
        error={Boolean(labelError)}
        data-qa-label
        // disabled={disabled}
      />
    </ExpansionPanel>
  );
};

export default DatabaseSettingsMaintenancePanel;
