import { Autocomplete, FormControl } from '@linode/ui';
import * as React from 'react';

import { titlecase } from 'src/features/Linodes/presentation';

import { getSelectedDeviceOption } from '../utilities';

import type { Disk } from '@linode/api-v4/lib/linodes';
import type { Volume } from '@linode/api-v4/lib/volumes';
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

  const counter = props.counter ?? 0;

  const diskOrVolumeInErrReason = errorText
    ? extractDiskOrVolumeId(errorText)
    : null;

  return (
    <div data-testid="device-select">
      {slots.map((slot, idx) => {
        const deviceList = Object.entries(devices).reduce(
          (acc, [type, items]) => {
            const device = titlecase(type);
            const options = (items as any[]).map(({ _id, label }) => {
              return { deviceType: device, label, value: _id };
            });
            return [...acc, ...options];
          },
          []
        );

        deviceList.unshift({
          deviceType: '',
          label: 'None',
          value: null,
        });

        const selectedDevice = getSelectedDeviceOption(
          getSelected(slot),
          deviceList
        );

        return counter < idx ? null : (
          <FormControl fullWidth key={slot}>
            <Autocomplete
              errorText={
                selectedDevice?.value === diskOrVolumeInErrReason && errorText
                  ? adjustedErrorText(errorText, selectedDevice.label)
                  : undefined
              }
              isOptionEqualToValue={(option, value) =>
                option.label === value.label
              }
              autoHighlight
              clearIcon={null}
              disabled={disabled}
              groupBy={(option) => option.deviceType}
              label={`/dev/${slot}`}
              noMarginTop
              onChange={(_, selected) => onChange(slot, selected?.value)}
              options={deviceList}
              placeholder={'None'}
              value={selectedDevice}
            />
          </FormControl>
        );
      })}
      {rescue && (
        <FormControl fullWidth>
          <Autocomplete
            disabled
            id="rescueDevice_sdh"
            label="/dev/sdh"
            noMarginTop
            onChange={() => null}
            options={[]}
            value={{ label: 'finnix' }}
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
