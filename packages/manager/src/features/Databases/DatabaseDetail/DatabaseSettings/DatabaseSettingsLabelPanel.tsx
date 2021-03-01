import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import { compose as recompose } from 'recompose';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Accordion from 'src/components/Accordion';
import Notice from 'src/components/Notice';
import PanelErrorBoundary from 'src/components/PanelErrorBoundary';
import TextField from 'src/components/TextField';
import useDatabases from 'src/hooks/useDatabases';
import { getAPIErrorOrDefault, getErrorMap } from 'src/utilities/errorUtils';

interface Props {
  databaseID: number;
  databaseLabel: string;
}

type CombinedProps = Props;

export const DatabaseSettingsLabelPanel: React.FC<CombinedProps> = (props) => {
  const { databaseID, databaseLabel } = props;

  const { updateDatabase } = useDatabases();

  const [label, setLabel] = React.useState<string>(databaseLabel);
  const [open, setOpen] = React.useState<boolean>(false);
  const [submitting, setSubmitting] = React.useState<boolean>(false);
  const [success, setSuccess] = React.useState<string | undefined>(undefined);
  const [errors, setErrors] = React.useState<APIError[] | undefined>();

  React.useEffect(() => {
    if (open) {
      setSuccess('');
    }
  }, [open]);

  const errorMap = getErrorMap(['label'], errors);
  const labelError = errorMap.label;
  const genericError = errorMap.none;

  const changeLabel = () => {
    setSubmitting(true);
    setSuccess(undefined);
    setErrors(undefined);

    updateDatabase(databaseID, { label })
      .then(() => {
        setSubmitting(false);
        setSuccess('Database label changed successfully.');
      })
      .catch((error) => {
        setSubmitting(false);
        setErrors(
          getAPIErrorOrDefault(
            error,
            'An error occurred while updating the label.'
          )
        );
      });
  };

  const handleLabelChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setLabel(e.target.value);
    },
    []
  );

  return (
    <Accordion
      heading="Edit Database Label"
      expanded={open}
      onChange={() => {
        setOpen(!open);
      }}
      success={success}
      actions={() => (
        <ActionsPanel>
          <Button
            onClick={changeLabel}
            buttonType="primary"
            disabled={submitting && !labelError}
            loading={submitting && !labelError}
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
        value={label}
        onChange={handleLabelChange}
        errorText={labelError}
        errorGroup="database-settings-label"
        data-qa-label
      />
    </Accordion>
  );
};

const errorBoundary = PanelErrorBoundary({ heading: 'Database Label' });

export default recompose<CombinedProps, Props>(errorBoundary)(
  DatabaseSettingsLabelPanel
);
