import { Disk } from '@linode/api-v4/lib/linodes';
import { useFormik } from 'formik';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import InputAdornment from 'src/components/core/InputAdornment';
import MenuItem from 'src/components/core/MenuItem';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import Drawer from 'src/components/Drawer';
import Grid from '@mui/material/Unstable_Grid2';
import { Notice } from 'src/components/Notice/Notice';
import TextField from 'src/components/TextField';
import { object, string } from 'yup';

import { useLinodeDiskUpdateMutation } from 'src/queries/linodes/disks';
import { useSnackbar } from 'notistack';
import { getErrorMap } from 'src/utilities/errorUtils';

const useStyles = makeStyles((theme: Theme) => ({
  root: {},
  section: {},
  divider: {
    margin: `${theme.spacing(2)} ${theme.spacing(1)} 0 `,
    width: `calc(100% - ${theme.spacing(2)})`,
  },
  formHelperTextLink: {
    display: 'block',
    marginTop: theme.spacing(1),
  },
}));

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

  const { mutateAsync: updateDisk, error } = useLinodeDiskUpdateMutation(
    linodeId,
    disk?.id ?? -1
  );

  const classes = useStyles();

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
    }
  }, [open]);

  const errorMap = getErrorMap(['label'], error);

  return (
    <Drawer title="Rename Disk" open={open} onClose={onClose}>
      <form onSubmit={formik.handleSubmit}>
        <Grid container direction="row">
          <Grid xs={12}>
            {errorMap.none && (
              <Notice
                error
                spacingBottom={8}
                errorGroup="linode-disk-drawer"
                text={errorMap.none}
              />
            )}
          </Grid>
          <Grid xs={12} className={classes.section}>
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
            <TextField
              disabled
              label="Filesystem"
              name="filesystem"
              select
              value={disk?.filesystem}
            >
              <MenuItem value="_none_">
                <em>Select a Filesystem</em>
              </MenuItem>
              {['raw', 'swap', 'ext3', 'ext4', 'initrd'].map((fs) => (
                <MenuItem value={fs} key={fs}>
                  {fs}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              disabled
              label="Size"
              type="number"
              name="size"
              required
              value={disk?.size}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">MB</InputAdornment>
                ),
              }}
              data-qa-disk-size
            />
          </Grid>
        </Grid>
        <ActionsPanel>
          <Button
            onClick={onClose}
            buttonType="secondary"
            className="cancel"
            data-qa-disk-cancel
          >
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
