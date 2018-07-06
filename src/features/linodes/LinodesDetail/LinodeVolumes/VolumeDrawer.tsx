


import FormControlLabel from '@material-ui/core/FormControlLabel';
import RadioGroup from '@material-ui/core/RadioGroup';
import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Drawer from 'src/components/Drawer';
import MenuItem from 'src/components/MenuItem';
import Radio from 'src/components/Radio';
import renderGuard from 'src/components/RenderGuard';
import TextField from 'src/components/TextField';
import { dcDisplayNames } from 'src/constants';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

export type Modes = 'create' | 'edit' | 'resize' | 'clone' | 'attach';

export interface State { }

export interface Props {
  label: string;
  linodeId: number;
  mode: Modes;
  open: boolean;
  region: string;
  size: number;
  title: string;
  onClose: () => void;
  onSubmit: () => void;

  attachableVolumes?: Linode.Volume[];
  cloneLabel?: string;
  cloning?: boolean;
  errors?: Linode.ApiFieldError[];
  selectedVolume?: string;
  onCloneLabelChange?: (id: string) => void;
  onLabelChange?: (id: string) => void;
  onLinodeChange?: (id: string) => void;
  onModeChange?: (mode: string) => void;
  onRegionChange?: (id: string) => void;
  onSizeChange?: (id: string) => void;
  onVolumeChange?: (value: string) => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const jawn = {
  size: 'size',
};

interface DisableableProps {
  disabled?: boolean;
}

class VolumeDrawer extends React.Component<CombinedProps, State> {
  state: State = {};

  onLabelChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    this.props.onLabelChange && this.props.onLabelChange(e.target.value);

  onSizeChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    this.props.onSizeChange && this.props.onSizeChange(e.target.value);

  onCloneLabelChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    this.props.onCloneLabelChange && this.props.onCloneLabelChange(e.target.value);

  onLinodeChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    this.props.onLinodeChange && this.props.onLinodeChange(e.target.value);

  onRegionChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    this.props.onRegionChange && this.props.onRegionChange(e.target.value);

  onVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    this.props.onVolumeChange && this.props.onVolumeChange(e.target.value);

  onModeChange = (e: React.ChangeEvent<HTMLInputElement>, value: string) =>
    this.props.onModeChange && this.props.onModeChange(value);

  labelField: React.StatelessComponent<DisableableProps> = ({ disabled }) => (
    <TextField
      data-qa-volume-label
      disabled={disabled}
      errorText={getAPIErrorFor(jawn, this.props.errors)('label')}
      label="Label"
      onChange={this.onLabelChange}
      value={this.props.label}
    />
  );

  cloneLabelField: React.StatelessComponent<DisableableProps> = ({ disabled }) => (
    <TextField
      data-qa-clone-from
      errorText={getAPIErrorFor(jawn, this.props.errors)('label')}
      label="Cloned Label"
      onChange={this.onCloneLabelChange}
      value={this.props.cloneLabel}
      disabled={disabled}
    />
  );

  sizeField: React.StatelessComponent<DisableableProps> = ({ disabled }) => (
    <TextField
      data-qa-size
      disabled={disabled}
      errorText={getAPIErrorFor(jawn, this.props.errors)('size')}
      label="Size"
      onChange={this.onSizeChange}
      value={this.props.size}
    />
  );

  regionField: React.StatelessComponent<DisableableProps> = ({ disabled }) => (
    <TextField
      data-qa-region
      disabled={disabled}
      errorText={getAPIErrorFor(jawn, this.props.errors)('region')}
      label="Region"
      onChange={this.onRegionChange}
      value={this.props.region && dcDisplayNames[this.props.region]}
    />
  );

  linodeField: React.StatelessComponent<DisableableProps> = ({ disabled }) => (
    <TextField
      data-qa-attach-to
      disabled={disabled}
      errorText={getAPIErrorFor(jawn, this.props.errors)('linode_id')}
      label="Attached To"
      onChange={this.onLinodeChange}
      value={this.props.linodeId}
    />
  );

  createForm = () => {
    return (
      <React.Fragment>
        <this.labelField />
        <this.sizeField />
      </React.Fragment>
    );
  }

  renameForm = () => {
    return <this.labelField />
  }

  resizeForm = () => {
    return <this.sizeField />
  }

  cloneForm = () => {
    return (
      <React.Fragment>
        <this.cloneLabelField />
        <this.labelField disabled />
        <this.sizeField disabled />
        <this.regionField disabled />
        <this.linodeField disabled />
      </React.Fragment>
    );
  }

  attachForm = () => {
    return (
      <TextField
        data-qa-volume-select
        label="Volume"
        select
        onChange={this.onVolumeChange}
        value={this.props.selectedVolume || 'none'}
        errorText={getAPIErrorFor(jawn, this.props.errors)('volume')}
      >
        <MenuItem value="none">Select a Volume</MenuItem>
        {
          this.props.attachableVolumes && this.props.attachableVolumes.map((volume) => (
            <MenuItem key={volume.id} value={volume.id}>{volume.label}</MenuItem>
          ))
        }
      </TextField>
    );
  }

  modeSelection = renderGuard(() => {
    const { mode } = this.props;
    return (
      <RadioGroup
        aria-label="mode"
        name="mode"
        value={mode}
        onChange={this.onModeChange}
        data-qa-mode-radio-group
      >
        <FormControlLabel value="create" label="Create and Attach Volume" control={<Radio />} />
        <FormControlLabel value="attach" label="Attach Existing Volume" control={<Radio />} />
      </RadioGroup>
    )
  })

  actions = renderGuard(() => (
    <ActionsPanel>
      <Button onClick={this.props.onSubmit} type="primary" data-qa-submit>
        Submit
      </Button>
      <Button onClick={this.props.onClose} type="secondary" data-qa-cancel>
        Cancel
      </Button>
    </ActionsPanel>
  ));

  render() {
    const { attachableVolumes, mode, open, title, onClose } = this.props;
    const displayModeSelection =
      attachableVolumes && attachableVolumes.length > 0 && ['create', 'attach'].includes(mode);

    return (
      <Drawer open={open} onClose={onClose} title={title}>
        {displayModeSelection && <this.modeSelection updateFor={[mode]} />}
        {mode === 'create' && this.createForm()}
        {mode === 'edit' && this.renameForm()}
        {mode === 'resize' && this.resizeForm()}
        {mode === 'clone' && this.cloneForm()}
        {mode === 'attach' && this.attachForm()}

        <this.actions updateFor={[]} />
      </Drawer>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(VolumeDrawer);
