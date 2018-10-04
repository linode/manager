import { clamp } from 'ramda';
import * as React from 'react';

import FormHelperText from '@material-ui/core/FormHelperText';
import InputAdornment from '@material-ui/core/InputAdornment';
import MenuItem from '@material-ui/core/MenuItem';
import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';

import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Drawer from 'src/components/Drawer';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';
import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';

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
}

interface State {
  hasErrorFor?: (v: string) => any,
  initialSize: number;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class LinodeDiskDrawer extends React.Component<CombinedProps, State> {
  state: State = {
    hasErrorFor: (v) => null,
    initialSize: this.props.size,
  };

  static getDerivedStateFromProps(props: CombinedProps, state: State) {
    return {
      hasErrorFor: getAPIErrorsFor({ label: 'label', size: 'size' }, props.errors || []),
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
    const { open, mode, onSubmit, submitting, onClose, classes } = this.props;

    const generalError = this.getErrors('none');

    return (
      <Drawer title={LinodeDiskDrawer.getTitle(mode)} open={open} onClose={onClose}>
        <Grid container direction="row">
          <Grid item xs={12}> 
            {generalError && <Notice error spacingBottom={8} errorGroup="linode-disk-drawer" text={generalError} />}
          </Grid>
          <Grid item xs={12} className={classes.section}>
            <this.labelField />
            <this.filesystemField />
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

const styled = withStyles(styles, { withTheme: true });

export default styled(LinodeDiskDrawer);
