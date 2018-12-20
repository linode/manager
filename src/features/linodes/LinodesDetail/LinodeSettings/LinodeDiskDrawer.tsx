import { clamp, pathOr } from 'ramda';
import * as React from 'react';
import { UserSSHKeyObject } from 'src/components/AccessPanel';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import FormHelperText from 'src/components/core/FormHelperText';
import InputAdornment from 'src/components/core/InputAdornment';
import MenuItem from 'src/components/core/MenuItem';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import Drawer from 'src/components/Drawer';
import { Item } from 'src/components/EnhancedSelect/Select';
import Grid from 'src/components/Grid';
import ModeSelect, { Mode } from 'src/components/ModeSelect';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';
import { getImages } from 'src/services/images';
import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';

import ImageAndPassword from './ImageAndPassword';

type ClassNames = 'root'
  | 'section'
  | 'divider';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
  section: {},
  divider: {
    margin: `${theme.spacing.unit * 2}px ${theme.spacing.unit}px 0 `,
    width: `calc(100% - ${theme.spacing.unit * 2}px)`,
  },
});

interface EditableFields {
  label: string;
  filesystem: string;
  size: number;
  password?: string;
  passwordError?: string;
  userSSHKeys?: UserSSHKeyObject[];
}

interface Props extends EditableFields {
  mode: 'create' | 'rename' | 'resize';
  open: boolean;
  errors?: Linode.ApiFieldError[];
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

interface State {
  hasErrorFor?: (v: string) => any,
  initialSize: number;
  selectedMode: diskMode;
  images: Linode.Image[];
  imageError?: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const modes = {
  EMPTY: 'create_empty' as diskMode,
  IMAGE: 'from_image' as diskMode,
}

type diskMode = 'create_empty' | 'from_image';

const modeList: Mode<diskMode>[] = [
  {
    label: "Create Empty Disk",
    mode: modes.EMPTY
  },
  {
    label: "Create from Image",
    mode: modes.IMAGE
  }
]

class LinodeDiskDrawer extends React.Component<CombinedProps, State> {
  state: State = {
    hasErrorFor: (v) => null,
    initialSize: this.props.size,
    selectedMode: modes.EMPTY,
    images: [],
  };

  componentDidMount() {
    getImages()
      .then((response) => {
        this.setState({
          images: response.data,
        });
      })
      .catch((errors) => {
        this.setState({
          imageError: pathOr(
            "There was an error loading your images.",
            ["response", "data", "errors", 0, "reason"],
            errors,
          )
        })
      });
  }

  static getDerivedStateFromProps(props: CombinedProps, state: State) {
    return {
      hasErrorFor: getAPIErrorsFor({ label: 'label', size: 'size', root_pass: 'root_pass' }, props.errors || []),
    };
  }

  static getTitle(v: 'create' | 'rename' | 'resize') {
    switch (v) {
      case 'create':
        return 'Add Disk';

      case 'rename':
        return 'Rename Disk';

      case 'resize':
        return 'Resize Disk';
    }
  }

  onLabelChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    this.props.onLabelChange(e.target.value);

  onSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { valueAsNumber } = e.target;
    if (isNaN(valueAsNumber)) {
      return this.props.onSizeChange('');
    }

    this.props.onSizeChange(clamp(0, this.props.maximumSize, valueAsNumber));
  };

  onFilesystemChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    this.props.onFilesystemChange(e.target.value);

  onModeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ selectedMode: e.target.value as diskMode });
    this.props.onResetImageMode(); // Reset image and root_pass
  }

  onImageChange = (selected: Item<string>) => {
    this.props.onImageChange(selected ? selected.value : undefined);
  }

  getErrors = (key: string) => this.state.hasErrorFor && this.state.hasErrorFor(key);

  labelField = () => (
    <TextField
      disabled={['resize'].includes(this.props.mode)}
      label="Label"
      required
      value={this.props.label}
      onChange={this.onLabelChange}
      errorText={this.getErrors('label')}
      errorGroup="linode-disk-drawer"
    />
  );

  filesystemField = () => (
    <TextField
      disabled={['resize', 'rename'].includes(this.props.mode)}
      label="Filesystem"
      select
      value={this.props.filesystem}
      onChange={this.onFilesystemChange}
      errorText={this.getErrors('filesystem')}
      errorGroup="linode-disk-drawer"
    >
      <MenuItem value="_none_"><em>Select a Filesystem</em></MenuItem>
      {
        ['raw', 'swap', 'ext3', 'ext4', 'initrd'].map(fs =>
          <MenuItem value={fs} key={fs}>{fs}</MenuItem>)
      }
    </TextField>
  );

  sizeField = () => (
    <React.Fragment>
      <TextField
        disabled={['rename'].includes(this.props.mode)}
        label="Size"
        type="number"
        required
        value={this.props.size}
        onChange={this.onSizeChange}
        errorText={this.getErrors('size')}
        errorGroup="linode-disk-drawer"
        InputProps={{
          endAdornment:
            <InputAdornment position="end">
              MB
            </InputAdornment>,
        }}
      />
      <FormHelperText style={{ marginTop: 8 }}>
        Maximum Size: {this.props.maximumSize} MB
      </FormHelperText>
    </React.Fragment>
  );

  render() {
    const {
      open,
      mode,
      onSubmit,
      submitting,
      onClose,
      classes,
      password,
      userSSHKeys,
    } = this.props;
    const { images, imageError, selectedMode } = this.state;

    const generalError = this.getErrors('none');
    const passwordError = this.getErrors('root_pass');

    return (
      <Drawer title={LinodeDiskDrawer.getTitle(mode)} open={open} onClose={onClose}>
        <Grid container direction="row">
          {mode === 'create' &&
            <Grid item>
              <ModeSelect modes={modeList} selected={selectedMode} onChange={this.onModeChange} />
            </Grid>
          }
          <Grid item xs={12}>
            {generalError && <Notice error spacingBottom={8} errorGroup="linode-disk-drawer" text={generalError} />}
          </Grid>
          <Grid item xs={12} className={classes.section}>
            <this.labelField />
            {selectedMode === modes.EMPTY && <this.filesystemField /> }
            {selectedMode === modes.IMAGE &&
              <ImageAndPassword
                images={images}
                imageError={imageError}
                onImageChange={this.onImageChange}
                password={password || ''}
                passwordError={passwordError}
                onPasswordChange={this.props.onPasswordChange}
                userSSHKeys={userSSHKeys || []}
              />
            }
            <this.sizeField />
          </Grid>
          <Grid item className={classes.section}>
            <ActionsPanel>
              <Button onClick={onSubmit} type="primary" loading={submitting}>Submit</Button>
              <Button onClick={onClose} type="secondary" className="cancel">
                Cancel
              </Button>
            </ActionsPanel>
          </Grid>
        </Grid>
      </Drawer>
    );
  }
}

const styled = withStyles(styles);

export default styled(LinodeDiskDrawer);
