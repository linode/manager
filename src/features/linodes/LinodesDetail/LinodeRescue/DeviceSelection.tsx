import * as React from 'react';
import { defaultTo } from 'ramda';

import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';
import InputLabel from 'material-ui/Input/InputLabel';
import MenuItem from 'material-ui/Menu/MenuItem';
import { FormControl } from 'material-ui/Form';

import Select from 'src/components/Select';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

interface Props {
  devices: (Linode.Disk & { _id: string } | Linode.Volume & { _id: string })[];
  selectedSda?: string;
  onSdaChange: (id: string) => void;

  selectedSdb?: string;
  onSdbChange: (id: string) => void;

  selectedSdc?: string;
  onSdcChange: (id: string) => void;

  selectedSdd?: string;
  onSddChange: (id: string) => void;

  selectedSde?: string;
  onSdeChange: (id: string) => void;

  selectedSdf?: string;
  onSdfChange: (id: string) => void;

  selectedSdg?: string;
  onSdgChange: (id: string) => void;

  counter?: number;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const DeviceSelection: React.StatelessComponent<CombinedProps> = (props) => {
  const {

    devices,
    selectedSda,
    onSdaChange,

    selectedSdb,
    onSdbChange,

    selectedSdc,
    onSdcChange,

    selectedSdd,
    onSddChange,

    selectedSde,
    onSdeChange,

    selectedSdf,
    onSdfChange,

    selectedSdg,
    onSdgChange,
  } = props;

  const counter = defaultTo(2, props.counter);

  return (
    <React.Fragment>
      <FormControl fullWidth>
        <InputLabel
          htmlFor="rescueDevice_sda"
          disableAnimation
          shrink={true}
        >
          /dev/sda
    </InputLabel>
        <Select
          value={selectedSda || ''}
          onChange={e => onSdaChange(e.target.value)}
          inputProps={{ name: 'rescueDevice_sda', id: 'rescueDevice_sda' }}
        >
          {
            devices.map(({ _id, label }) =>
              <MenuItem key={_id} value={_id}>{label}</MenuItem>)
          }
        </Select>
      </FormControl>
      <FormControl fullWidth>
        <InputLabel
          htmlFor="rescueDevice_sdb"
          disableAnimation
          shrink={true}
        >
          /dev/sdb
      </InputLabel>
        <Select
          value={selectedSdb || ''}
          onChange={e => onSdbChange(e.target.value)}
          inputProps={{ name: 'rescueDevice_sdb', id: 'rescueDevice_sdb' }}
        >
          {
            devices.map(({ _id, label }) =>
              <MenuItem key={_id} value={_id}>{label}</MenuItem>)
          }
        </Select>
      </FormControl>
      {counter >= 3 && <FormControl fullWidth>
        <InputLabel
          htmlFor="rescueDevice_sdc"
          disableAnimation
          shrink={true}
        >
          /dev/sdc
      </InputLabel>
        <Select
          value={selectedSdc || ''}
          onChange={e => onSdcChange(e.target.value)}
          inputProps={{ name: 'rescueDevice_sdc', id: 'rescueDevice_sdc' }}
        >
          {
            devices.map(({ _id, label }) =>
              <MenuItem key={_id} value={_id}>{label}</MenuItem>)
          }
        </Select>
      </FormControl>}
      {counter >= 4 && < FormControl fullWidth>
        <InputLabel
          htmlFor="rescueDevice_sdd"
          disableAnimation
          shrink={true}
        >
          /dev/sdd
      </InputLabel>
        <Select
          value={selectedSdd || ''}
          onChange={e => onSddChange(e.target.value)}
          inputProps={{ name: 'rescueDevice_sdd', id: 'rescueDevice_sdd' }}
        >
          {
            devices.map(({ _id, label }) =>
              <MenuItem key={_id} value={_id}>{label}</MenuItem>)
          }
        </Select>
      </FormControl>}
      {counter >= 5 && <FormControl fullWidth>
        <InputLabel
          htmlFor="rescueDevice_sde"
          disableAnimation
          shrink={true}
        >
          /dev/sde
      </InputLabel>
        <Select
          value={selectedSde || ''}
          onChange={e => onSdeChange(e.target.value)}
          inputProps={{ name: 'rescueDevice_sde', id: 'rescueDevice_sde' }}
        >
          {
            devices.map(({ _id, label }) =>
              <MenuItem key={_id} value={_id}>{label}</MenuItem>)
          }
        </Select>
      </FormControl>}
      {counter >= 6 && <FormControl fullWidth>
        <InputLabel
          htmlFor="rescueDevice_sdf"
          disableAnimation
          shrink={true}
        >
          /dev/sdf
      </InputLabel>
        <Select
          value={selectedSdf || ''}
          onChange={e => onSdfChange(e.target.value)}
          inputProps={{ name: 'rescueDevice_sdf', id: 'rescueDevice_sdf' }}
        >
          {
            devices.map(({ _id, label }) =>
              <MenuItem key={_id} value={_id}>{label}</MenuItem>)
          }
        </Select>
      </FormControl>}
      {counter >= 7 && <FormControl fullWidth>
        <InputLabel
          htmlFor="rescueDevice_sdg"
          disableAnimation
          shrink={true}
        >
          /dev/sdg
      </InputLabel>
        <Select
          value={selectedSdg || ''}
          onChange={e => onSdgChange(e.target.value)}
          inputProps={{ name: 'rescueDevice_sdg', id: 'rescueDevice_sdg' }}
        >
          {
            devices.map(({ _id, label }) =>
              <MenuItem key={_id} value={_id}>{label}</MenuItem>)
          }
        </Select>
      </FormControl>}
      <FormControl fullWidth>
        <InputLabel
          htmlFor="rescueDevice_sdh"
          disableAnimation
          shrink={true}
        >
          /dev/sdh
      </InputLabel>
        <Select
          disabled
          value={'finnix-1'}
          inputProps={{ name: 'rescueDevice_sdh', id: 'rescueDevice_sdh' }}
        >
          {
            [{ _id: 'finnix-1', label: 'Finiix Media Reboot' }].map(({ _id, label }) =>
              <MenuItem key={_id} value={_id}>{label}</MenuItem>)
          }
        </Select>
      </FormControl>

    </React.Fragment >
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(DeviceSelection);
