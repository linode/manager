import * as Bluebird from 'bluebird';
import { append, clamp, compose, flatten, pathOr, range } from 'ramda';
import * as React from 'react';

import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import FormLabel from '@material-ui/core/FormLabel';
import RadioGroup from '@material-ui/core/RadioGroup';
import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import ActionsPanel from 'src/components/ActionsPanel';
import Drawer from 'src/components/Drawer';
import Grid from 'src/components/Grid';
import MenuItem from 'src/components/MenuItem';
import Notice from 'src/components/Notice';
import Radio from 'src/components/Radio';
import TextField from 'src/components/TextField';
import Toggle from 'src/components/Toggle';
import DeviceSelection, { ExtendedDisk, ExtendedVolume } from 'src/features/linodes/LinodesDetail/LinodeRescue/DeviceSelection';
import { getLinodeKernels } from 'src/services/linodes';
import { DevicesAsStrings } from 'src/utilities/createDevicesFromStrings';
import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';

type ClassNames = 'root'
  | 'section'
  | 'divider';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
  section: {
    marginTop: theme.spacing.unit * 2,
  },
  divider: {
    margin: `${theme.spacing.unit * 2}px ${theme.spacing.unit}px 0 `,
    width: `calc(100% - ${theme.spacing.unit * 2}px)`,
  },
});

interface EditableFields {
  open: boolean;
  useCustomRoot: boolean;
  label: string;
  devices: DevicesAsStrings;
  kernel?: string;
  comments?: string;
  memory_limit?: number;
  run_level?: 'default' | 'single' | 'binbash';
  virt_mode?: 'fullvirt' | 'paravirt';
  helpers: {
    updatedb_disabled: boolean;
    distro: boolean;
    modules_dep: boolean;
    network: boolean;
    devtmpfs_automount: boolean;
  };
  root_device: string;
}

interface Props extends EditableFields {
  mode: 'create' | 'edit';
  errors?: Linode.ApiFieldError[];
  useCustomRoot: boolean;
  maxMemory: number;
  availableDevices: {
    disks: ExtendedDisk[];
    volumes: ExtendedVolume[];
  };
  onClose: () => void;
  onSubmit: () => void;
  onChange: (k: keyof EditableFields, v: any) => void;
}

interface State {
  kernels?: Linode.Kernel[];
  loading: boolean;
  errors?: Linode.ApiFieldError[];
}

type CombinedProps = Props & WithStyles<ClassNames>;

class LinodeConfigDrawer extends React.Component<CombinedProps, State> {
  state: State = {
    loading: true,
  };

  requestKernels = () => {
    this.setState({ loading: true });

    // Get first page of kernels.
    return getLinodeKernels()
      .then(({ data: firstPageData, page, pages }) => {
        // If we only have one page, return it.
        if (page === pages) { return firstPageData; }

        // Create an iterable list of the remaining pages.
        const remainingPages = range(page + 1, pages + 1);

        return Bluebird.map(remainingPages, currentPage =>
          getLinodeKernels(currentPage)
            .then(response => response.data),
        )
          .then(compose(flatten, append(firstPageData)));
      })
      .then((data: Linode.Kernel[]) => {
        this.setState({
          loading: false,
          kernels: data,
        })
      })
      .catch(error => {
        this.setState({
          loading: false,
          errors: pathOr([{ reason: 'Unable to load kernesl.' }], ['response', 'data', 'errors'], error),
        })
      });
  };

  componentDidUpdate(prevProps: CombinedProps, prevState: State) {
    if (prevProps.open === false && this.props.open === true && !prevState.kernels) {
      this.requestKernels();
    }
  }

  render() {
    const {
      errors,
      availableDevices,

      // Editable Values
      open,
      label,
      comments,
      virt_mode,
      kernel,
      run_level,
      memory_limit,
      devices,
      useCustomRoot,
      root_device,
      helpers,
      maxMemory,

      // Handlers
      onSubmit,
      onClose,
      onChange,

      classes,
    } = this.props;

    const { kernels } = this.state;

    const errorFor = getAPIErrorsFor({}, errors);
    const generalError = errorFor('none');

    return (
      <Drawer
        title="Add Linode Configuration"
        open={open}
        onClose={onClose}
      >
        <Grid container direction="row">
          {generalError && <Notice error errorGroup="linode-config-drawer" text={generalError} />}
          <Grid item xs={12} className={classes.section}>
            <Typography role="header" variant="subheading">Label and Comments</Typography>
            <TextField
              label="Label"
              required
              value={label}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('label', e.target.value)}
              errorText={errorFor('label')}
              errorGroup="linode-config-drawer"
            />

            <TextField
              label="Comments"
              value={comments}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('comments', e.target.value)}
              multiline={true}
              rows={3}
              errorText={errorFor('comments')}
              errorGroup="linode-config-drawer"
            />
          </Grid>

          <Divider className={classes.divider} />

          <Grid item xs={12} className={classes.section}>
            <Typography role="header" variant="subheading">Virtual Machine</Typography>
            <FormControl component="fieldset">
              <FormLabel
                htmlFor="virt_mode"
                component="label"
              >
                VM Mode
            </FormLabel>
              <RadioGroup
                aria-label="virt_mode"
                name="virt_mode"
                value={virt_mode}
                onChange={(e, value: 'paravirt' | 'fullvirt') => onChange('virt_mode', value)}
              >
                <FormControlLabel value="paravirt" label="Paravirtulization" control={<Radio />} />
                <FormControlLabel value="fullvirt" label="Full-virtulization" control={<Radio />} />
              </RadioGroup>
            </FormControl>
          </Grid>

          <Divider className={classes.divider} />

          <Grid item xs={12} className={classes.section}>
            <Typography role="header" variant="subheading">Boot Settings</Typography>
            <TextField
              label="Kernel"
              select={true}
              value={kernel}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('kernel', e.target.value)}
              errorText={errorFor('kernel')}
              errorGroup="linode-config-drawer"
            >
              <MenuItem value="none" disabled><em>Select a Kernel</em></MenuItem>
              {kernels &&
                kernels.map(kernel =>
                  <MenuItem
                    // Can't use ID for key until DBA-162 is closed.
                    key={`${kernel.id}-${kernel.label}`}
                    value={kernel.id}
                  >
                    {kernel.label}
                  </MenuItem>)
              }
            </TextField>

            <FormControl fullWidth component="fieldset">
              <FormLabel
                htmlFor="run_level"
                component="label"
              >
                Run Level
              </FormLabel>
              <RadioGroup
                aria-label="run_level"
                name="run_level"
                value={run_level}
                onChange={(e, value: 'binbash' | 'default' | 'single') =>
                  onChange('run_level', value)}
              >
                <FormControlLabel value="default" label="Run Default Level" control={<Radio />} />
                <FormControlLabel value="single" label="Single user mode" control={<Radio />} />
                <FormControlLabel value="binbash" label="init=/bin/bash" control={<Radio />} />
              </RadioGroup>
            </FormControl>

            <TextField
              type="number"
              label="Memory Limit"
              value={memory_limit}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('memory_limit', clamp(0, maxMemory, +e.target.value))}
              helperText={`Max: ${maxMemory}`}
            />
          </Grid>

          <Divider className={classes.divider} />

          <Grid item xs={12} className={classes.section}>
            <Typography role="header" variant="subheading">Block Device Assignment</Typography>
            <DeviceSelection
              slots={['sda', 'sdb', 'sdc', 'sdd', 'sde', 'sdf', 'sdg', 'sdh']}
              devices={availableDevices}
              onChange={(slot, value) => onChange('devices', { ...devices, [slot]: value })}
              getSelected={slot => pathOr('', ['devices', slot], this.props)}
              counter={99}
            />

            <FormControl fullWidth>
              <FormControlLabel
                label="Use Custom Root"
                control={
                  <Toggle
                    checked={useCustomRoot}
                    onChange={(e, v) => onChange('useCustomRoot', v)}
                  />
                }
              />

              <TextField
                label={`${useCustomRoot ? 'Custom ' : ''}Root Device`}
                value={root_device}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('root_device', e.target.value)}
                inputProps={{ name: 'root_device', id: 'root_device' }}
                select={!useCustomRoot}
                fullWidth
                autoFocus={useCustomRoot && true}
                errorText={errorFor('root_device')}
                errorGroup="linode-config-drawer"
              >
                {
                  !useCustomRoot &&
                  [
                    '/dev/sda',
                    '/dev/sdb',
                    '/dev/sdc',
                    '/dev/sdd',
                    '/dev/sde',
                    '/dev/sdf',
                    '/dev/sdg',
                    '/dev/sdh',
                  ].map(path => <MenuItem key={path} value={path}>{path}</MenuItem>)
                }
              </TextField>
            </FormControl>
          </Grid>

          <Divider className={classes.divider} />

          <Grid item xs={12} className={classes.section}>
            <Typography role="header" variant="subheading">Filesystem/Boot Helpers</Typography>
            <FormControl fullWidth component="fieldset">
              <FormGroup>
                <FormControlLabel
                  label="Distro Helper"
                  control={
                    <Toggle
                      checked={helpers.distro}
                      onChange={(e, v) => onChange('helpers', { ...helpers, distro: v })}
                    />
                  }
                />

                <FormControlLabel
                  label="Disable updatedb"
                  control={
                    <Toggle
                      checked={helpers.updatedb_disabled}
                      onChange={(e, v) => onChange('helpers', { ...helpers, updatedb_disabled: v })}
                    />
                  }
                />

                <FormControlLabel
                  label="modules.dep Helper"
                  control={
                    <Toggle
                      checked={helpers.modules_dep}
                      onChange={(e, v) => onChange('helpers', { ...helpers, modules_dep: v })}
                    />
                  }
                />

                <FormControlLabel
                  label="automount devtpmfs"
                  control={
                    <Toggle
                      checked={helpers.devtmpfs_automount}
                      onChange={(e, v) =>
                        onChange('helpers', { ...helpers, devtmpfs_automount: v })}
                    />
                  }
                />

                <FormControlLabel
                  label="auto-configure networking"
                  control={
                    <Toggle
                      checked={helpers.network}
                      onChange={(e, v) => onChange('helpers', { ...helpers, network: v })}
                    />
                  }
                />
              </FormGroup>
            </FormControl>
          </Grid>
          <Grid item>
            <ActionsPanel>
              <Button onClick={onSubmit} variant="raised" color="primary">Submit</Button>
              <Button
                variant="raised"
                color="secondary"
                className="cancel"
                onClick={onClose}
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

export default styled(LinodeConfigDrawer);
