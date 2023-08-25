import { styled } from '@mui/material/styles';
import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { Accordion } from 'src/components/Accordion';
import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Notice } from 'src/components/Notice/Notice';
import { TextField } from 'src/components/TextField';
import {
  useLinodeQuery,
  useLinodeUpdateMutation,
} from 'src/queries/linodes/linodes';
import { getErrorMap } from 'src/utilities/errorUtils';

interface Props {
  isReadOnly?: boolean;
  linodeId: number;
}

export const LinodeSettingsLabelPanel = (props: Props) => {
  const { isReadOnly, linodeId } = props;
  const { enqueueSnackbar } = useSnackbar();

  const { data: linode } = useLinodeQuery(linodeId);

  const {
    error,
    isLoading,
    mutateAsync: updateLinode,
  } = useLinodeUpdateMutation(linodeId);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      label: linode?.label ?? '',
    },
    async onSubmit({ label }) {
      await updateLinode({ label });
      enqueueSnackbar(`Successfully updated Linode label to ${label}`, {
        variant: 'success',
      });
    },
  });

  const errorMap = getErrorMap(['label'], error);
  const labelError = errorMap.label;
  const generalError = errorMap.none;

  return (
    <Accordion
      actions={() => (
        <StyledActionsPanel
          primaryButtonProps={{
            'data-testid': 'label-save',
            disabled: isReadOnly || !formik.dirty,
            label: 'Save',
            loading: isLoading,
            onClick: () => formik.handleSubmit(),
          }}
        />
      )}
      defaultExpanded
      heading="Linode Label"
    >
      {Boolean(generalError) && <Notice text={generalError} variant="error" />}
      <TextField
        data-qa-label
        disabled={isReadOnly}
        errorGroup="linode-settings-label"
        errorText={labelError}
        label="Label"
        name="label"
        onChange={formik.handleChange}
        value={formik.values.label}
      />
    </Accordion>
  );
};

const StyledActionsPanel = styled(ActionsPanel, {
  label: 'StyledActionsPanel',
})({
  justifyContent: 'flex-start',
  margin: 0,
});
