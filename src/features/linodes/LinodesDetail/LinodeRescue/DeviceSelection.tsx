import { defaultTo } from 'ramda';
import * as React from 'react';
import FormControl from 'src/components/core/FormControl';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
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
        const deviceList = Object.entries(devices).map(([type, items]) => {
          const device = titlecase(type);
          return {
            label: device,
            value: type,
            options: (items as any[]).map(({ _id, label }) => {
              return { label, value: _id };
            })
          };
        });

        return counter < idx ? null : (
          <FormControl
            updateFor={[getSelected(slot), classes]}
            key={slot}
            fullWidth
          >
            <Select
              options={deviceList}
              defaultValue={getSelected(slot) || 'none'}
              onChange={(e: Item<string>) => onChange(slot, e.value)}
              disabled={disabled}
              placeholder={'None'}
              isClearable={false}
              label={`/dev/${slot}`}
              noMarginTop
            />
          </FormControl>
        );
      })}
      {rescue && (
        <FormControl fullWidth>
          <Select
            disabled
            onChange={() => onChange}
            options={[]}
            defaultValue={'finnix'}
            name="rescueDevice_sdh"
            id="rescueDevice_sdh"
            label="/dev/sdh"
            placeholder="Finnix Media"
            noMarginTop
          />
        </FormControl>
      )}
    </React.Fragment>
  );
};

const styled = withStyles(styles);

export default styled(DeviceSelection) as React.ComponentType<Props>;
