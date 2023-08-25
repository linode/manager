import { Disk } from '@linode/api-v4/lib/linodes';
import { useFormik } from 'formik';
import * as React from 'react';
import { object, string } from 'yup';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Drawer } from 'src/components/Drawer';
import { Notice } from 'src/components/Notice/Notice';
import { TextField } from 'src/components/TextField';
import { useLinodeDiskUpdateMutation } from 'src/queries/linodes/disks';
import { handleAPIErrors } from 'src/utilities/formikErrorUtils';

const RenameDiskSchema = object({
  label: string()
    .required('Label is required.')
    .min(3, 'Label must contain between 3 and 32 characters.')
    .max(32, 'Label must contain between 3 and 32 characters.'),
});

export interface Props {
  disk?: Disk;
  linodeId: number;
  onClose: () => void;
  open: boolean;
}

export const RenameDiskDrawer = (props: Props) => {
  const { disk, linodeId, onClose, open } = props;

  const { mutateAsync: updateDisk, reset } = useLinodeDiskUpdateMutation(
    linodeId,
    disk?.id ?? -1
  );

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      label: disk?.label ?? '',
    },
    async onSubmit(values, helpers) {
      try {
        await updateDisk(values);
        onClose();
      } catch (e) {
        handleAPIErrors(e, helpers.setFieldError, helpers.setStatus);
      }
    },
    validateOnChange: true,
    validationSchema: RenameDiskSchema,
  });

  React.useEffect(() => {
    if (open) {
      formik.resetForm();
      reset();
    }
  }, [open]);

  return (
    <Drawer onClose={onClose} open={open} title="Rename Disk">
      <form onSubmit={formik.handleSubmit}>
        {formik.status && (
          <Notice
            errorGroup="linode-disk-drawer"
            spacingBottom={8}
            text={formik.status}
            variant="error"
          />
        )}
        <TextField
          data-qa-label
          errorGroup="linode-disk-drawer"
          errorText={formik.errors.label}
          label="Label"
          name="label"
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          required
          value={formik.values.label}
        />
        <ActionsPanel
          primaryButtonProps={{
            'data-testid': 'submit-disk-form',
            label: 'Rename',
            loading: formik.isSubmitting,
            type: 'submit',
          }}
          secondaryButtonProps={{ label: 'Cancel', onClick: onClose }}
        />
      </form>
    </Drawer>
  );
};
