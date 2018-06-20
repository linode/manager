import * as React from 'react';

import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
  MenuItem,
} from 'material-ui';
import Button from 'material-ui/Button';
import FormHelperText from 'material-ui/Form/FormHelperText';

import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';
import Grid from 'src/components/Grid';
import Drawer from 'src/components/Drawer';
import TextField from 'src/components/TextField';
import ActionsPanel from 'src/components/ActionsPanel';
import Notice from 'src/components/Notice';

type ClassNames = 'root'
  | 'section'
  | 'divider';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
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
  mode: 'create' | 'edit';
  open: boolean;
  errors?: Linode.ApiFieldError[];
  totalSpaceMB: number;
  freeSpaceMB: number;
  onClose: () => void;
  onSubmit: () => void;
  onChange: (k: keyof EditableFields, v: any) => void;
}

interface State { }

type CombinedProps = Props & WithStyles<ClassNames>;

class LinodeDiskDrawer extends React.Component<CombinedProps, State> {
  state: State = {};

  render() {
    const {
      errors,
      open,
      mode,

      // Editable Values
      label,
      filesystem,
      size,

      // Handlers
      onSubmit,
      onClose,
      onChange,

      classes,
    } = this.props;
    const title = mode === 'create' ? 'Add Disk' : 'Edit Disk';
    const errorFor = getAPIErrorsFor({}, errors);
    const generalError = errorFor('none');
    const labelError = errorFor('label');
    const filesystemError = errorFor('filesystem');
    const sizeError = errorFor('size');

    return (
      <Drawer
        title={title}
        open={open}
        onClose={onClose}
      >
        <Grid container direction="row">
          {generalError && <Notice error errorGroup="linode-disk-drawer" text={generalError} />}
          <Grid item xs={12} className={classes.section}>

            <TextField
              label="Label"
              required
              value={label}
              onChange={e => onChange('label', e.target.value)}
              errorText={labelError}
              errorGroup="linode-disk-drawer"
            />

            {mode === 'create' && <TextField
              label="Filesystem"
              select
              value={filesystem}
              onChange={e => onChange('filesystem', e.target.value)}
              errorText={filesystemError}
              errorGroup="linode-disk-drawer"
            >
              <MenuItem value="_none_"><em>Select a Filesystem</em></MenuItem>
              {
                ['raw', 'swap', 'ext3', 'ext4', 'initrd'].map(fs =>
                  <MenuItem value={fs} key={fs}>{fs}</MenuItem>)
              }
            </TextField>}

            {mode === 'create' && (
              <React.Fragment>
                <TextField
                  label="Size"
                  type="number"
                  required
                  value={size}
                  onChange={e => onChange('size', e.target.value === '' ? '' : +e.target.value)}
                  errorText={sizeError}
                  errorGroup="linode-disk-drawer"
                  InputProps={{
                    endAdornment: 'MB',
                  }}
                />
                <FormHelperText style={{ marginTop: 8 }}>
                  {this.props.freeSpaceMB} MB free of {this.props.totalSpaceMB} MB
                </FormHelperText>
              </React.Fragment>
            )}
          </Grid>
          <Grid item className={classes.section}>
            <ActionsPanel>
              <Button onClick={onSubmit} variant="raised" color="primary">Submit</Button>
              <Button
                onClick={onClose}
                variant="raised"
                color="secondary"
                className="cancel"
              >
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
