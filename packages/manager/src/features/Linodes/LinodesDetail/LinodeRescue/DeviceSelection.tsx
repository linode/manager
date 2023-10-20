import { Disk } from '@linode/api-v4/lib/linodes';
import { Volume } from '@linode/api-v4/lib/volumes';
import { defaultTo } from 'ramda';
import * as React from 'react';

import Select, { Item } from 'src/components/EnhancedSelect/Select';
import { FormControl } from 'src/components/FormControl';
import { titlecase } from 'src/features/Linodes/presentation';
import { getSelectedOptionFromGroupedOptions } from 'src/utilities/getSelectedOptionFromGroupedOptions';

export interface ExtendedDisk extends Disk {
  _id: string;
}

export interface ExtendedVolume extends Volume {
  _id: string;
}

interface Props {
  counter?: number;
  devices: {
    disks: ExtendedDisk[];
    volumes: ExtendedVolume[];
  };
  disabled?: boolean;
  errorText?: string;
  getSelected: (slot: string) => string;
  onChange: (slot: string, id: string) => void;
  rescue?: boolean;
  slots: string[];
}

export const DeviceSelection = (props: Props) => {
  const {
    devices,
    disabled,
    errorText,
    getSelected,
    onChange,
    rescue,
    slots,
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
            options: (items as any[]).map(({ _id, label }) => {
              return { label, value: _id };
            }),
            value: type,
          };
        });

        deviceList.unshift({
          label: '',
          options: [{ label: 'None', value: null }],
          value: '',
        });

        const selectedDevice = getSelectedOptionFromGroupedOptions(
          getSelected(slot),
          deviceList
        );

        return counter < idx ? null : (
          <FormControl fullWidth key={slot}>
            <Select
              errorText={
                selectedDevice?.value === diskOrVolumeInErrReason && errorText
                  ? adjustedErrorText(errorText, selectedDevice.label)
                  : undefined
              }
              disabled={disabled}
              isClearable={false}
              label={`/dev/${slot}`}
              noMarginTop
              onChange={(e: Item<string>) => onChange(slot, e.value)}
              options={deviceList}
              placeholder={'None'}
              value={selectedDevice}
            />
          </FormControl>
        );
      })}
      {rescue && (
        <FormControl fullWidth>
          <Select
            defaultValue={{ label: 'finnix', value: 'finnix' }}
            disabled
            id="rescueDevice_sdh"
            label="/dev/sdh"
            name="rescueDevice_sdh"
            noMarginTop
            onChange={() => null}
            placeholder="Finnix Media"
          />
        </FormControl>
      )}
    </div>
  );
};

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
