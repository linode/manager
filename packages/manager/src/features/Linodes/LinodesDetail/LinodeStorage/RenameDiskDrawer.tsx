import { Disk } from '@linode/api-v4/lib/linodes';
import { useFormik } from 'formik';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Drawer from 'src/components/Drawer';
import { Notice } from 'src/components/Notice/Notice';
import TextField from 'src/components/TextField';
import { object, string } from 'yup';
import { useLinodeDiskUpdateMutation } from 'src/queries/linodes/disks';
import { useSnackbar } from 'notistack';
import { getErrorMap } from 'src/utilities/errorUtils';

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

  const { mutateAsync: updateDisk, error, reset } = useLinodeDiskUpdateMutation(
    linodeId,
    disk?.id ?? -1
  );

  const { enqueueSnackbar } = useSnackbar();

  const formik = useFormik({
    initialValues: {
      label: disk?.label ?? '',
    },
    validationSchema: RenameDiskSchema,
    validateOnChange: true,
    enableReinitialize: true,
    async onSubmit(values) {
      await updateDisk(values);
      enqueueSnackbar(
        `Successfully updated disk label from ${disk?.label} to ${values.label}`,
        { variant: 'success' }
      );
      onClose();
    },
  });

  React.useEffect(() => {
    if (open) {
      formik.resetForm();
      reset();
    }
  }, [open]);

  const errorMap = getErrorMap(['label'], error);

  return (
    <Drawer title="Rename Disk" open={open} onClose={onClose}>
      <form onSubmit={formik.handleSubmit}>
        {errorMap.none && (
          <Notice
            error
            spacingBottom={8}
            errorGroup="linode-disk-drawer"
            text={errorMap.none}
          />
        )}
        <TextField
          label="Label"
          name="label"
          required
          value={formik.values.label}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          errorText={formik.touched.label ? formik.errors.label : undefined}
          errorGroup="linode-disk-drawer"
          data-qa-label
        />
        <ActionsPanel>
          <Button onClick={onClose} buttonType="secondary" className="cancel">
            Cancel
          </Button>
          <Button
            buttonType="primary"
            type="submit"
            loading={formik.isSubmitting}
            data-testid="submit-disk-form"
          >
            Rename
          </Button>
        </ActionsPanel>
      </form>
    </Drawer>
  );
};
