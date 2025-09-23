import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { ConfigRowDevice } from './ConfigRowDevice';

describe('ConfigRowDevice', () => {
  it('renders "volume" when passed a volume device', () => {
    const { getByText } = renderWithTheme(
      <ConfigRowDevice
        device={{ disk_id: null, volume_id: 1 }}
        deviceKey="sda"
        linodeId={0}
      />
    );

    expect(getByText('/dev/sda – Volume 1')).toBeVisible();
  });

  it('renders "Disk" when passed a disk device', () => {
    const { getByText } = renderWithTheme(
      <ConfigRowDevice
        device={{ disk_id: 2, volume_id: null }}
        deviceKey="sdb"
        linodeId={0}
      />
    );

    expect(getByText('/dev/sdb – Disk 2')).toBeVisible();
  });

  it('renders "Unknown" if the device is malformed', () => {
    const { getByText } = renderWithTheme(
      <ConfigRowDevice
        // @ts-expect-error testing an invalid device
        device={{ disk_id: null, volume_id: null }}
        deviceKey="sda"
        linodeId={0}
      />
    );

    expect(getByText('/dev/sda – Unknown')).toBeVisible();
  });

  it('renders nothing when the device itself is null', () => {
    const { container } = renderWithTheme(
      <ConfigRowDevice device={null} deviceKey="sda" linodeId={0} />
    );

    expect(container).toBeEmptyDOMElement();
  });
});
