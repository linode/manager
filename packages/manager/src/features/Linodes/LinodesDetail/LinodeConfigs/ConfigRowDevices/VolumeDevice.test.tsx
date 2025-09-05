import React from 'react';

import { volumeFactory } from 'src/factories';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { VolumeDevice } from './VolumeDevice';

describe('VolumeDevice', () => {
  it("renders 'Volume <Volume ID>'  by default", () => {
    const { getByText } = renderWithTheme(
      <VolumeDevice device={{ disk_id: null, volume_id: 1 }} deviceKey="sda" />
    );

    expect(getByText('/dev/sda – Volume 1')).toBeVisible();
  });

  it("renders volume's label once the volume loads", async () => {
    const volume = volumeFactory.build({ id: 5, label: 'my-attached-volume' });

    server.use(
      http.get(`*/v4*/volumes/${volume.id}`, () => HttpResponse.json(volume))
    );

    const { findByText } = renderWithTheme(
      <VolumeDevice device={{ disk_id: null, volume_id: 5 }} deviceKey="sdc" />
    );

    expect(await findByText('/dev/sdc – my-attached-volume')).toBeVisible();
  });
});
