import { defaultTo, flatten } from 'ramda';
import * as React from 'react';
import FormControl from 'src/components/core/FormControl';
import Select, { GroupType, Item } from 'src/components/EnhancedSelect/Select';
import { titlecase } from 'src/features/linodes/presentation';

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

type CombinedProps = Props;

export const getSelectedOption = (
  selectedValue: string,
  options: GroupType<string>[]
) => {
  if (!selectedValue) {
    return null;
  }
  // Ramda's flatten doesn't seem able to handle the typing issues here, but this returns an array of Item<string>.
  const optionsList = (flatten(
    options.map(group => group.options)
  ) as unknown) as Item<string>[];
  return optionsList.find(option => option.value === selectedValue) || null;
};

const DeviceSelection: React.StatelessComponent<CombinedProps> = props => {
  const { devices, onChange, getSelected, slots, rescue, disabled } = props;

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

        deviceList.unshift({
          value: '',
          label: '',
          options: [{ value: null, label: 'None' }]
        });

        const selectedDevice = getSelectedOption(getSelected(slot), deviceList);

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
