import { APIError } from '@linode/api-v4/lib/types';
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

interface EditableFields {
  label: string;
  filesystem: string;
  size: number;
  password?: string;
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
  onSubmit: () => void;
  onLabelChange: (value: string) => void;
  onFilesystemChange: (value: string) => void;
  onSizeChange: (value: number | string) => void;
  onImageChange: (selected: string | undefined) => void;
  onPasswordChange: (password: string) => void;
  onResetImageMode: () => void;
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
  const { open, mode, submitting, password, userSSHKeys, requestKeys } = props;

  const classes = useStyles();

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

  const onLabelChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    props.onLabelChange(e.target.value);

  const onSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { valueAsNumber } = e.target;
    if (isNaN(valueAsNumber)) {
      return props.onSizeChange('');
    }

    props.onSizeChange(valueAsNumber);
  };

  const onFilesystemChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    props.onFilesystemChange(e.target.value);

  const onModeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedMode(e.target.value as diskMode);
    props.onResetImageMode(); // Reset image and root_pass
  };

  const onImageChange = (selected: Item<string>) => {
    props.onImageChange(selected ? selected.value : undefined);
  };

  const getErrors = (key: string) => '';

  const labelField = () => (
    <TextField
      disabled={['resize'].includes(props.mode)}
      label="Label"
      required
      value={props.label}
      onChange={onLabelChange}
      errorText={getErrors('label')}
      errorGroup="linode-disk-drawer"
      data-qa-label
    />
  );

  const filesystemField = () => (
    <TextField
      disabled={['resize', 'rename'].includes(props.mode)}
      label="Filesystem"
      select
      value={props.filesystem}
      onChange={onFilesystemChange}
      errorText={getErrors('filesystem')}
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
  );

  const sizeField = () => (
    <React.Fragment>
      <TextField
        disabled={['rename'].includes(props.mode)}
        label="Size"
        type="number"
        required
        value={props.size}
        onChange={onSizeChange}
        errorText={getErrors('size')}
        errorGroup="linode-disk-drawer"
        InputProps={{
          endAdornment: <InputAdornment position="end">MB</InputAdornment>
        }}
        data-qa-disk-size
      />
      <FormHelperText style={{ marginTop: 8 }}>
        Maximum Size: {props.maximumSize} MB
      </FormHelperText>
    </React.Fragment>
  );

  const generalError = ''; // this.getErrors('none');
  const passwordError = ''; // this.getErrors('root_pass');
  const imageFieldError = ''; // this.getErrors('image');

  return (
    <Drawer title={getTitle(mode)} open={open} onClose={props.onClose}>
      <Grid container direction="row">
        {mode === 'create' && (
          <Grid item data-qa-mode-toggle>
            <ModeSelect
              modes={modeList}
              selected={selectedMode}
              onChange={onModeChange}
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
            {labelField()}
            {selectedMode === modes.EMPTY && filesystemField()}
            {selectedMode === modes.IMAGE && (
              <ImageAndPassword
                onImageChange={onImageChange}
                imageFieldError={imageFieldError}
                password={password || ''}
                passwordError={passwordError}
                onPasswordChange={props.onPasswordChange}
                userSSHKeys={userSSHKeys || []}
                requestKeys={requestKeys || (() => null)}
              />
            )}
            {sizeField()}
          </form>
        </Grid>
        <Grid item className={classes.section}>
          <ActionsPanel>
            <Button
              onClick={props.onSubmit}
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
