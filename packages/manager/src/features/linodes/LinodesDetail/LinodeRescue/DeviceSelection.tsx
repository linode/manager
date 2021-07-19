import { Disk } from '@linode/api-v4/lib/linodes';
import { Volume } from '@linode/api-v4/lib/volumes';
import { defaultTo } from 'ramda';
import * as React from 'react';
import FormControl from 'src/components/core/FormControl';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import { titlecase } from 'src/features/linodes/presentation';
import getSelectedOptionFromGroupedOptions from 'src/utilities/getSelectedOptionFromGroupedOptions';

export interface ExtendedDisk extends Disk {
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
  errorText?: string;
}

type CombinedProps = Props;

const DeviceSelection: React.FC<CombinedProps> = (props) => {
  const {
    devices,
    onChange,
    getSelected,
    slots,
    rescue,
    disabled,
    errorText,
  } = props;

  const counter = defaultTo(0, props.counter) as number;

  const diskOrVolumeInErrReason = errorText
    ? extractDiskOrVolumeId(errorText)
    : null;

  return (
    <div data-testid="device-select">
      {slots.map((slot, idx) => {
        const deviceList = Object.entries(devices).map(([type, items]) => {
          const device = titlecase(type);
          return {
            label: device,
            value: type,
            options: (items as any[]).map(({ _id, label }) => {
              return { label, value: _id };
            }),
          };
        });

        deviceList.unshift({
          value: '',
          label: '',
          options: [{ value: null, label: 'None' }],
        });

        const selectedDevice = getSelectedOptionFromGroupedOptions(
          getSelected(slot),
          deviceList
        );

        return counter < idx ? null : (
          <FormControl
            updateFor={[selectedDevice, deviceList, errorText]}
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
              errorText={
                selectedDevice?.value === diskOrVolumeInErrReason && errorText
                  ? adjustedErrorText(errorText, selectedDevice.label)
                  : undefined
              }
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
    </div>
  );
};

export default DeviceSelection as React.ComponentType<Props>;

const blockDeviceRegex = /[0-9]+/g;

export const extractDiskOrVolumeId = (errorText: string) => {
  const type = errorText.includes('disk') ? 'disk' : 'volume';

  const blockDeviceRegexMatch = errorText.match(blockDeviceRegex)?.[0];

  // if there's a match, return a string structured in a way that it is easily compared to selectedDevice.value
  return blockDeviceRegexMatch
    ? `${type}-${Number(blockDeviceRegexMatch)}`
    : null;
};

export const adjustedErrorText = (errorText: string, deviceLabel?: string) => {
  return deviceLabel ? `${deviceLabel} is already in use.` : errorText;
};
