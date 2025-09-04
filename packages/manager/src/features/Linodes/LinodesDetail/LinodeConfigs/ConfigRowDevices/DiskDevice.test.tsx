import React from 'react';

import { linodeDiskFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { DiskDevice } from './DiskDevice';

describe('DiskDevice', () => {
  it("renders 'Disk <Disk ID>' by default", () => {
    const { getByText } = renderWithTheme(
      <DiskDevice
        device={{ disk_id: 2, volume_id: null }}
        deviceKey="sdb"
        linodeId={0}
      />
    );

    expect(getByText('/dev/sdb – Disk 2')).toBeVisible();
  });

  it("renders the disk's label once the Linode's disks load", async () => {
    const linodeId = 1;
    const disks = [
      linodeDiskFactory.build({ id: 1, label: 'My Disk 1' }),
      linodeDiskFactory.build({ id: 2, label: 'My Disk 2' }),
    ];

    server.use(
      http.get(`*/v4*/linode/instances/${linodeId}/disks`, () =>
        HttpResponse.json(makeResourcePage(disks))
      )
    );

    const { findByText } = renderWithTheme(
      <DiskDevice
        device={{ disk_id: 2, volume_id: null }}
        deviceKey="sdb"
        linodeId={linodeId}
      />
    );

    expect(await findByText('/dev/sdb – My Disk 2')).toBeVisible();
  });
});
