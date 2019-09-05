import { Volume } from 'linode-js-sdk/lib/volumes';
import { defaultTo } from 'ramda';
import * as React from 'react';
import FormControl from 'src/components/core/FormControl';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import { titlecase } from 'src/features/linodes/presentation';
import getSelectedOptionFromGroupedOptions from 'src/utilities/getSelectedOptionFromGroupedOptions';

export interface ExtendedDisk extends Linode.Disk {
  _id: string;
}

export interface ExtendedVolume extends Volume {
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

type CombinedProps = Props;

const DeviceSelection: React.StatelessComponent<CombinedProps> = props => {
  const { devices, onChange, getSelected, slots, rescue, disabled } = props;

  const counter = defaultTo(0, props.counter) as number;

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

        deviceList.unshift({
          value: '',
          label: '',
          options: [{ value: null, label: 'None' }]
        });

        const selectedDevice = getSelectedOptionFromGroupedOptions(
          getSelected(slot),
          deviceList
        );

        return counter < idx ? null : (
          <FormControl
            updateFor={[selectedDevice, deviceList]}
            key={slot}
            fullWidth
          >
            <Select
              options={deviceList}
              value={selectedDevice}
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

export default DeviceSelection as React.ComponentType<Props>;
