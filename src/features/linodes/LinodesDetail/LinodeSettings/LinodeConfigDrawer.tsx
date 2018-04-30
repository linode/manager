import * as React from 'react';
import { clamp, pathOr } from 'ramda';

import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';
import Typography from 'material-ui/Typography';
import RadioGroup from 'material-ui/Radio/RadioGroup';
import FormControlLabel from 'material-ui/Form/FormControlLabel';
import MenuItem from 'material-ui/Menu/MenuItem';
import FormControl from 'material-ui/Form/FormControl';
import FormLabel from 'material-ui/Form/FormLabel';
import FormGroup from 'material-ui/Form/FormGroup';
import Button from 'material-ui/Button';

import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';
import { DevicesAsStrings } from 'src/utilities/createDevicesFromStrings';
import DeviceSelection, { ExtendedDisk, ExtendedVolume }
  from 'src/features/linodes/LinodesDetail/LinodeRescue/DeviceSelection';
import Grid from 'src/components/Grid';
import Drawer from 'src/components/Drawer';
import TextField from 'src/components/TextField';
import Radio from 'src/components/Radio';
import Toggle from 'src/components/Toggle';
import ActionsPanel from 'src/components/ActionsPanel';

type ClassNames = 'root';


const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
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
  kernels: Linode.Kernel[];
  maxMemory: number;
  availableDevices: {
    disks: ExtendedDisk[];
    volumes: ExtendedVolume[];
  };
  onClose: () => void;
  onSubmit: () => void;
  onChange: (k: keyof EditableFields, v: any) => void;
}

interface State { }

type CombinedProps = Props & WithStyles<ClassNames>;

class LinodeConfigDrawer extends React.Component<CombinedProps, State> {
  state: State = {};

  render() {
    const {
      errors,
      kernels,
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

    } = this.props;

    const errorFor = getAPIErrorsFor({}, errors);

    return (
      <Drawer
        title="Add Linode Configuration"
        open={open}
        onClose={onClose}
      >
        <Grid container direction="row">
          <Grid item>
            <Typography component="div" variant="headline">Label and Comments</Typography>
            <TextField
              label="Label"
              required
              value={label}
              onChange={e => onChange('label', e.target.value)}
              errorText={errorFor('label')}

            />

            <TextField
              label="Comments"
              value={comments}
              onChange={e => onChange('comments', e.target.value)}
              multiline={true}
              rows={3}
              errorText={errorFor('comments')}
            />
          </Grid>

          <Grid item>
            <Typography component="div" variant="headline">Virtual Machine</Typography>
            <FormControl component="fieldset">
              <FormLabel
                htmlFor="virt_mode"
                component="legend"
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

          <Grid item xs={12}>
            <Typography component="div" variant="headline">Boot Settings</Typography>
            <TextField
              label="Kernel"
              select={true}
              value={kernel}
              onChange={e => onChange('kernel', e.target.value)}
            >
              <MenuItem value="none" disabled><em>Select a Kernel</em></MenuItem>
              {
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
              <FormLabel htmlFor="run_level" component="label">
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
              label="Memory Limit"
              value={memory_limit}
              onChange={e => onChange('memory_limit', clamp(0, maxMemory, +e.target.value))}
              helperText={`Max: ${maxMemory}`}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography component="div" variant="headline">Block Device Assignment</Typography>
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
                onChange={e => onChange('root_device', e.target.value)}
                inputProps={{ name: 'root_device', id: 'root_device' }}
                select={!useCustomRoot}
                fullWidth
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

          <Grid item xs={12}>
            <Typography component="div" variant="headline">Filesystem/Boot Helpers</Typography>
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
              <Button onClick={onClose}>Cancel</Button>
            </ActionsPanel>
          </Grid>
        </Grid>
      </Drawer>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(LinodeConfigDrawer);
