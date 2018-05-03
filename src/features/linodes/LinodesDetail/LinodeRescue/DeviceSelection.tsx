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
import FormControl from 'material-ui/Form/FormControl';

import Select from 'src/components/Select';
import { titlecase } from 'src/features/linodes/presentation';
type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

export interface ExtendedDisk extends Linode.Disk {
  _id: string;
}

export interface ExtendedVolume extends Linode.Volume {
  _id: string;
}

interface Props {
  devices: {
    disks: ExtendedDisk[];
    volumes: ExtendedVolume[];
  };
  onChange: (slot: string, id: string) => void;
  getSelected: (slot: string) => string;
  counter?: number;
  slots: string[];
  rescue?: boolean;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const DeviceSelection: React.StatelessComponent<CombinedProps> = (props) => {
  const {
    devices,
    onChange,
    getSelected,
    slots,
    rescue,
  } = props;

  const counter = defaultTo(0, props.counter);

  return (
    <React.Fragment>
      {
        slots.map((slot, idx) => {
          return counter < idx ? null : <FormControl key={slot} fullWidth>
            <InputLabel
              htmlFor={`rescueDevice_${slot}`}
              disableAnimation
              shrink={true}
            >
              /dev/{slot}
            </InputLabel>
            <Select
              fullWidth
              value={getSelected(slot) || 'none'}
              onChange={e => onChange(slot, e.target.value)}
              inputProps={{ name: `rescueDevice_${slot}`, id: `rescueDevice_${slot}` }}
            >
              <MenuItem value="none">None</MenuItem>
              {
                Object
                  .entries(devices)
                  .map(([type, items]) => [
                    <MenuItem
                      className="selectHeader"
                      disabled
                    >
                      {titlecase(type)}
                    </MenuItem>,
                    ...(items as any[]).map(({ _id, label }) =>
                      <MenuItem key={_id} value={_id}>{label}</MenuItem>),
                  ])
              }
            </Select>
          </FormControl>;
        })
      }
      {rescue && <FormControl fullWidth>
        <InputLabel htmlFor={`rescueDevice_sdh`} disableAnimation shrink={true} >
          /dev/sdh
        </InputLabel>
        <Select
          disabled
          value={'finnix'}
          inputProps={{ name: `rescueDevice_sdh`, id: `rescueDevice_sdh` }}
        >
          <MenuItem value="finnix">Finnix Media</MenuItem>
        </Select>
      </FormControl>}
    </React.Fragment >
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(DeviceSelection);
