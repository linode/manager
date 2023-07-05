import { Disk } from '@linode/api-v4/lib/linodes';
import { useFormik } from 'formik';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel/ActionsPanel';
import Drawer from 'src/components/Drawer';
import { Notice } from 'src/components/Notice/Notice';
import { TextField } from 'src/components/TextField';
import { object, string } from 'yup';
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
  open: boolean;
  onClose: () => void;
  linodeId: number;
}

export const RenameDiskDrawer = (props: Props) => {
  const { disk, open, onClose, linodeId } = props;

  const { mutateAsync: updateDisk, reset } = useLinodeDiskUpdateMutation(
    linodeId,
    disk?.id ?? -1
  );

  const formik = useFormik({
    initialValues: {
      label: disk?.label ?? '',
    },
    validationSchema: RenameDiskSchema,
    validateOnChange: true,
    enableReinitialize: true,
    async onSubmit(values, helpers) {
      try {
        await updateDisk(values);
        onClose();
      } catch (e) {
        handleAPIErrors(e, helpers.setFieldError, helpers.setStatus);
      }
    },
  });

  React.useEffect(() => {
    if (open) {
      formik.resetForm();
      reset();
    }
  }, [open]);

  return (
    <Drawer title="Rename Disk" open={open} onClose={onClose}>
      <form onSubmit={formik.handleSubmit}>
        {formik.status && (
          <Notice
            error
            spacingBottom={8}
            errorGroup="linode-disk-drawer"
            text={formik.status}
          />
        )}
        <TextField
          label="Label"
          name="label"
          required
          value={formik.values.label}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          errorText={formik.errors.label}
          errorGroup="linode-disk-drawer"
          data-qa-label
        />
        <ActionsPanel
          primary
          primaryButtonDataTestId="submit-disk-form"
          primaryButtonLoading={formik.isSubmitting}
          primaryButtonText="Rename"
          primaryButtonType="submit"
          secondary
          secondaryButtonHandler={onClose}
          secondaryButtonText="Cancel"
        />
      </form>
    </Drawer>
  );
};
