import { defaultTo } from 'ramda';
import * as React from 'react';
import FormControl from 'src/components/core/FormControl';
import InputLabel from 'src/components/core/InputLabel';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import MenuItem from 'src/components/MenuItem';
import Select from 'src/components/Select';
import { titlecase } from 'src/features/linodes/presentation';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {}
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
  disabled?: boolean;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const DeviceSelection: React.StatelessComponent<CombinedProps> = props => {
  const {
    devices,
    onChange,
    getSelected,
    slots,
    rescue,
    classes,
    disabled
  } = props;

  const counter = defaultTo(0, props.counter);

  return (
    <React.Fragment>
      {slots.map((slot, idx) => {
        return counter < idx ? null : (
          <FormControl
            updateFor={[getSelected(slot), classes]}
            key={slot}
            fullWidth
          >
            <InputLabel
              htmlFor={`rescueDevice_${slot}`}
              disableAnimation
              shrink={true}
              disabled={disabled}
            >
              /dev/{slot}
            </InputLabel>
            <Select
              fullWidth
              value={getSelected(slot) || 'none'}
              onChange={e => onChange(slot, e.target.value)}
              inputProps={{
                name: `rescueDevice_${slot}`,
                id: `rescueDevice_${slot}`
              }}
              disabled={disabled}
            >
              <MenuItem value="none">None</MenuItem>
              {Object.entries(devices).map(([type, items]) => [
                <MenuItem
                  className="selectHeader"
                  disabled
                  key={type}
                  data-qa-type={titlecase(type)}
                >
                  {titlecase(type)}
                </MenuItem>,
                ...(items as any[]).map(({ _id, label }) => (
                  <MenuItem key={_id} value={_id} data-qa-option={label}>
                    {label}
                  </MenuItem>
                ))
              ])}
            </Select>
          </FormControl>
        );
      })}
      {rescue && (
        <FormControl fullWidth>
          <InputLabel
            htmlFor={`rescueDevice_sdh`}
            disableAnimation
            shrink={true}
            disabled={disabled}
          >
            /dev/sdh
          </InputLabel>
          <Select
            disabled
            value={'finnix'}
            inputProps={{ name: `rescueDevice_sdh`, id: `rescueDevice_sdh` }}
          >
            <MenuItem value="finnix">Finnix Media</MenuItem>
          </Select>
        </FormControl>
      )}
    </React.Fragment>
  );
};

const styled = withStyles(styles);

export default styled(DeviceSelection) as React.ComponentType<Props>;
