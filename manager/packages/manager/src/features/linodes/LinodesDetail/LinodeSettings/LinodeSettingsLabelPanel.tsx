import { GrantLevel } from '@linode/api-v4/lib/account';
import { APIError } from '@linode/api-v4/lib/types';
import { pathOr } from 'ramda';
import * as React from 'react';
import { compose as recompose } from 'recompose';
import Accordion from 'src/components/Accordion';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Notice from 'src/components/Notice';
import PanelErrorBoundary from 'src/components/PanelErrorBoundary';
import TextField from 'src/components/TextField';
import {
  UpdateLinode,
  withLinodeDetailContext,
} from 'src/features/linodes/LinodesDetail/linodeDetailContext';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

type CombinedProps = ContextProps;

export const LinodeSettingsLabelPanel: React.FC<CombinedProps> = (props) => {
  const { linodeLabel, permissions, updateLinode } = props;

  const [initialValue, setInitialValue] = React.useState<string>(linodeLabel);
  const [updatedValue, setUpdatedValue] = React.useState<string>(linodeLabel);
  const [submitting, setSubmitting] = React.useState<boolean>(false);
  const [success, setSuccess] = React.useState<string | undefined>(undefined);
  const [errors, setErrors] = React.useState<APIError[] | undefined>(undefined);

  const changeLabel = () => {
    setInitialValue(updatedValue);
    setSubmitting(true);
    setSuccess(undefined);
    setErrors(undefined);

    updateLinode({ label: updatedValue })
      .then(() => {
        setSuccess('Linode label changed successfully.');
        setSubmitting(false);
      })
      .catch((error) => {
        setSubmitting(false);
        setErrors(
          getAPIErrorOrDefault(error, 'An error occurred while updating label')
        );
        scrollErrorIntoView('linode-settings-label');
      });
  };

  const hasErrorFor = getAPIErrorFor({}, errors);
  const labelError = hasErrorFor('label');
  const disabled = permissions === 'read_only';
  const genericError =
    errors &&
    !labelError &&
    pathOr('An error occurred while updating label', [0, 'reason'], errors);

  return (
    <Accordion
      defaultExpanded
      heading="Linode Label"
      success={success}
      actions={() => (
        <ActionsPanel>
          <Button
            buttonType="primary"
            disabled={
              disabled ||
              (submitting && !labelError) ||
              initialValue === updatedValue
            }
            loading={submitting && !labelError}
            onClick={changeLabel}
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
        disabled={disabled}
        errorText={labelError}
        errorGroup="linode-settings-label"
        error={Boolean(labelError)}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setUpdatedValue(e.target.value)
        }
        value={updatedValue}
        data-qa-label
      />
    </Accordion>
  );
};

const errorBoundary = PanelErrorBoundary({ heading: 'Linode Label' });

interface ContextProps {
  linodeLabel: string;
  updateLinode: UpdateLinode;
  permissions: GrantLevel;
}

const linodeContext = withLinodeDetailContext<ContextProps>(
  ({ linode, updateLinode }) => ({
    linodeLabel: linode.label,
    permissions: linode._permissions,
    updateLinode,
  })
);

export default recompose<CombinedProps, {}>(
  errorBoundary,
  linodeContext
)(LinodeSettingsLabelPanel) as React.ComponentType<{}>;
