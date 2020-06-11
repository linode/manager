import { APIError } from '@linode/api-v4/lib/types';
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

import ImageAndPassword from '../LinodeSettings/ImageAndPassword';

const useStyles = makeStyles((theme: Theme) => ({
  root: {},
  section: {},
  divider: {
    margin: `${theme.spacing(2)}px ${theme.spacing(1)}px 0 `,
    width: `calc(100% - ${theme.spacing(2)}px)`
  }
}));

type FileSystem = 'raw' | 'swap' | 'ext3' | 'ext4' | 'initrd' | '_none_';

interface EditableFields {
  // label: string;
  // filesystem: string;
  // size: number;
  // password?: string;
  passwordError?: string;
  userSSHKeys?: UserSSHKeyObject[];
  requestKeys?: () => void;
}

interface Props extends EditableFields {
  mode: 'create' | 'rename' | 'resize';
  open: boolean;
  errors?: APIError[];
  maximumSize: number;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (values: any) => void;
  // onLabelChange: (value: string) => void;
  // onFilesystemChange: (value: string) => void;
  // onSizeChange: (value: number | string) => void;
  // onImageChange: (selected: string | undefined) => void;
  // onPasswordChange: (password: string) => void;
  // onResetImageMode: () => void;
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

const getTitle = (v: 'create' | 'rename' | 'resize') => {
  switch (v) {
    case 'create':
      return 'Add Disk';

    case 'rename':
      return 'Rename Disk';

    case 'resize':
      return 'Resize Disk';
  }
};

export const LinodeDiskDrawer: React.FC<CombinedProps> = props => {
  const { open, mode, submitting, onSubmit, userSSHKeys, requestKeys } = props;

  const classes = useStyles();

  const formik = useFormik({
    initialValues: {
      label: '',
      filesystem: '_none_' as FileSystem,
      size: 0,
      image: '',
      password: ''
    },
    onSubmit
  });

  const [selectedMode, setSelectedMode] = React.useState<string>(modes.EMPTY);

  React.useEffect(() => {
    if (open) {
      setSelectedMode(modes.EMPTY);
    }
  }, [open]);

  // static getDerivedStateFromProps(props: CombinedProps, state: State) {
  //   return {
  //     hasErrorFor: getAPIErrorsFor(
  //       { label: 'label', size: 'size', root_pass: 'root_pass' },
  //       props.errors || []
  //     )
  //   };
  // }

  //   props.onSizeChange(valueAsNumber);
  // };

  // const onFilesystemChange = (e: React.ChangeEvent<HTMLInputElement>) =>
  //   props.onFilesystemChange(e.target.value);

  // const onModeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setSelectedMode(e.target.value as diskMode);
  //   props.onResetImageMode(); // Reset image and root_pass
  // };

  const generalError = ''; // this.getErrors('none');

  return (
    <Drawer title={getTitle(mode)} open={open} onClose={props.onClose}>
      <Grid container direction="row">
        {mode === 'create' && (
          <Grid item data-qa-mode-toggle>
            <ModeSelect
              modes={modeList}
              selected={selectedMode}
              onChange={e => setSelectedMode(e.target.value)}
            />
          </Grid>
        )}
        <Grid item xs={12}>
          {generalError && (
            <Notice
              error
              spacingBottom={8}
              errorGroup="linode-disk-drawer"
              text={generalError}
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
              errorText={formik.errors.label?.[0]}
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
                errorText={formik.errors.filesystem?.[0]}
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
                  formik.setFieldValue('image', selected.value)
                }
                imageFieldError={formik.errors.image?.[0]}
                password={formik.values.password}
                passwordError={formik.errors.password?.[0]}
                onPasswordChange={(password: string) =>
                  formik.setFieldValue('password', password)
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
              errorText={formik.errors.size?.[0]}
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
              loading={submitting}
              data-qa-disk-submit
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

export default React.memo(LinodeDiskDrawer);
