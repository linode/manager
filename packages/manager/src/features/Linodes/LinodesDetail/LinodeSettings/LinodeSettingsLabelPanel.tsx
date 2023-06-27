import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { Accordion } from 'src/components/Accordion';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import { Notice } from 'src/components/Notice/Notice';
import { TextField } from 'src/components/TextField';
import { getErrorMap } from 'src/utilities/errorUtils';
import {
  useLinodeQuery,
  useLinodeUpdateMutation,
} from 'src/queries/linodes/linodes';

interface Props {
  linodeId: number;
  isReadOnly?: boolean;
}

export const LinodeSettingsLabelPanel = (props: Props) => {
  const { linodeId, isReadOnly } = props;
  const { enqueueSnackbar } = useSnackbar();

  const { data: linode } = useLinodeQuery(linodeId);

  const {
    mutateAsync: updateLinode,
    isLoading,
    error,
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
      defaultExpanded
      heading="Linode Label"
      actions={() => (
        <ActionsPanel>
          <Button
            buttonType="primary"
            disabled={isReadOnly || !formik.dirty}
            loading={isLoading}
            onClick={() => formik.handleSubmit()}
            data-qa-label-save
          >
            Save
          </Button>
        </ActionsPanel>
      )}
    >
      {Boolean(generalError) && <Notice error text={generalError} />}
      <TextField
        label="Label"
        disabled={isReadOnly}
        errorText={labelError}
        errorGroup="linode-settings-label"
        name="label"
        onChange={formik.handleChange}
        value={formik.values.label}
        data-qa-label
      />
    </Accordion>
  );
};
