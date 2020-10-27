import {
  Disk,
  CreateLinodeDiskSchema,
  CreateLinodeDiskFromImageSchema,
  ResizeLinodeDiskSchema
} from '@linode/api-v4/lib/linodes';
import { useFormik } from 'formik';
import * as React from 'react';
import { UserSSHKeyObject } from 'src/components/AccessPanel';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import FormHelperText from 'src/components/core/FormHelperText';
import InputAdornment from 'src/components/core/InputAdornment';
import MenuItem from 'src/components/core/MenuItem';
import { makeStyles, Theme } from 'src/components/core/styles';
import Drawer from 'src/components/Drawer';
import { Item } from 'src/components/EnhancedSelect/Select';
import Grid from 'src/components/Grid';
import ModeSelect, { Mode } from 'src/components/ModeSelect';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';
import {
  handleFieldErrors,
  handleGeneralErrors
} from 'src/utilities/formikErrorUtils';
import { extendValidationSchema } from 'src/utilities/validatePassword';
import { object, string } from 'yup';

import ImageAndPassword from '../LinodeSettings/ImageAndPassword';

const useStyles = makeStyles((theme: Theme) => ({
  root: {},
  section: {},
  divider: {
    margin: `${theme.spacing(2)}px ${theme.spacing(1)}px 0 `,
    width: `calc(100% - ${theme.spacing(2)}px)`
  }
}));

/**
 * This is a situation-specific schemas that doesn't correspond to
 * an API endpoint, which is why it lives here and not in api-v4.
 *
 */
const RenameDiskSchema = object({
  label: string()
    .required('Label is required.')
    .min(3, 'Label must contain between 3 and 32 characters.')
    .max(32, 'Label must contain between 3 and 32 characters.')
});

type FileSystem = 'raw' | 'swap' | 'ext3' | 'ext4' | 'initrd' | '_none_';

type DrawerMode = 'create' | 'rename' | 'resize';

export interface Props {
  mode: DrawerMode;
  disk?: Disk;
  open: boolean;
  maximumSize: number;
  onClose: () => void;
  onSubmit: (values: any) => Promise<any>;
  passwordError?: string;
  userSSHKeys?: UserSSHKeyObject[];
  requestKeys?: () => void;
}

type CombinedProps = Props;

export const modes = {
  EMPTY: 'create_empty' as diskMode,
  IMAGE: 'from_image' as diskMode
};

type diskMode = 'create_empty' | 'from_image';

const modeList: Mode<diskMode>[] = [
  {
    label: 'Create Empty Disk',
    mode: modes.EMPTY
  },
  {
    label: 'Create from Image',
    mode: modes.IMAGE
  }
];

const submitLabelMap = {
  create: 'Add',
  rename: 'Rename',
  resize: 'Resize'
};

const getTitle = (v: DrawerMode) => {
  switch (v) {
    case 'create':
      return 'Add Disk';

    case 'rename':
      return 'Rename Disk';

    case 'resize':
      return 'Resize Disk';
  }
};

export const DiskDrawer: React.FC<CombinedProps> = props => {
  const {
    disk,
    open,
    maximumSize,
    mode,
    onClose,
    onSubmit,
    userSSHKeys,
    requestKeys
  } = props;

  const CreateFromImageSchema = () =>
    extendValidationSchema(CreateLinodeDiskFromImageSchema);

  const getSchema = (mode: DrawerMode, diskMode: diskMode) => {
    switch (mode) {
      case 'create':
        return diskMode === 'from_image'
          ? CreateFromImageSchema
          : CreateLinodeDiskSchema;
      case 'rename':
        return RenameDiskSchema;
      case 'resize':
        return ResizeLinodeDiskSchema;
    }
  };

  const classes = useStyles();
  const [selectedMode, setSelectedMode] = React.useState<diskMode>(modes.EMPTY);

  const { resetForm, ...formik } = useFormik({
    initialValues: {
      label: disk?.label ?? '',
      filesystem: disk?.filesystem ?? ('ext4' as FileSystem),
      size: disk?.size || maximumSize || 0,
      image: '',
      root_pass: ''
    },
    validationSchema: getSchema(mode, selectedMode),
    validateOnChange: true,
    onSubmit: values => submitForm(values)
  });

  React.useEffect(() => {
    if (open) {
      setSelectedMode(modes.EMPTY);
      resetForm();
    }
  }, [open, resetForm]);

  const submitForm = (values: any) => {
    // Clear drawer error state
    formik.setStatus(undefined);
    formik.setErrors({});

    onSubmit(values)
      .then(() => {
        formik.setSubmitting(false);
        onClose();
      })
      .catch(err => {
        const mapErrorToStatus = (generalError: string) =>
          formik.setStatus({ generalError });

        formik.setSubmitting(false);
        handleFieldErrors(formik.setErrors, err);
        handleGeneralErrors(
          mapErrorToStatus,
          err,
          'An unexpected error occurred.'
        );
      });
  };

  return (
    <Drawer title={getTitle(mode)} open={open} onClose={props.onClose}>
      <Grid container direction="row">
        {mode === 'create' && (
          <Grid item data-qa-mode-toggle>
            <ModeSelect
              modes={modeList}
              selected={selectedMode}
              onChange={e => setSelectedMode(e.target.value as diskMode)}
            />
          </Grid>
        )}
        <Grid item xs={12}>
          {formik.status && (
            <Notice
              error
              spacingBottom={8}
              errorGroup="linode-disk-drawer"
              text={formik.status.generalError}
            />
          )}
        </Grid>
        <Grid item xs={12} className={classes.section}>
          <form>
            <TextField
              disabled={['resize'].includes(props.mode)}
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
            {selectedMode === modes.EMPTY && (
              <TextField
                disabled={['resize', 'rename'].includes(props.mode)}
                label="Filesystem"
                name="filesystem"
                select
                value={formik.values.filesystem}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                errorText={
                  formik.touched.filesystem
                    ? formik.errors.filesystem
                    : undefined
                }
                errorGroup="linode-disk-drawer"
              >
                <MenuItem value="_none_">
                  <em>Select a Filesystem</em>
                </MenuItem>
                {['raw', 'swap', 'ext3', 'ext4', 'initrd'].map(fs => (
                  <MenuItem value={fs} key={fs}>
                    {fs}
                  </MenuItem>
                ))}
              </TextField>
            )}
            {selectedMode === modes.IMAGE && (
              <ImageAndPassword
                onImageChange={(selected: Item) =>
                  formik.setFieldValue('image', selected?.value ?? null)
                }
                imageFieldError={
                  formik.touched.image ? formik.errors.image : undefined
                }
                password={formik.values.root_pass}
                passwordError={
                  formik.touched.root_pass ? formik.errors.root_pass : undefined
                }
                onPasswordChange={(root_pass: string) =>
                  formik.setFieldValue('root_pass', root_pass)
                }
                userSSHKeys={userSSHKeys || []}
                requestKeys={requestKeys || (() => null)}
              />
            )}
            <TextField
              disabled={['rename'].includes(props.mode)}
              label="Size"
              type="number"
              name="size"
              required
              value={formik.values.size}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              errorText={formik.touched.size ? formik.errors.size : undefined}
              errorGroup="linode-disk-drawer"
              InputProps={{
                endAdornment: <InputAdornment position="end">MB</InputAdornment>
              }}
              data-qa-disk-size
            />
            <FormHelperText style={{ marginTop: 8 }}>
              Maximum Size: {props.maximumSize} MB
            </FormHelperText>
          </form>
        </Grid>
        <Grid item className={classes.section}>
          <ActionsPanel>
            <Button
              onClick={() => formik.handleSubmit()}
              buttonType="primary"
              loading={formik.isSubmitting}
              data-testid="submit-disk-form"
            >
              {submitLabelMap[mode]}
            </Button>
            <Button
              onClick={props.onClose}
              buttonType="secondary"
              className="cancel"
              data-qa-disk-cancel
            >
              Cancel
            </Button>
          </ActionsPanel>
        </Grid>
      </Grid>
    </Drawer>
  );
};

export default React.memo(DiskDrawer);
