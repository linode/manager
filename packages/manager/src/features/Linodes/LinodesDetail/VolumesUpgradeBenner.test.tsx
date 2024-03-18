import React from 'react';

import { notificationFactory, volumeFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { VolumesUpgradeBanner } from './VolumesUpgradeBanner';

describe('VolumesUpgradeBanner', () => {
  it('should render if there is an upgradable volume', async () => {
    const volume = volumeFactory.build();
    const notification = notificationFactory.build({
      entity: { id: volume.id, type: 'volume' },
      type: 'volume_migration_scheduled',
    });

    server.use(
      http.get('*/linode/instances/:id/volumes', () => {
        return HttpResponse.json(makeResourcePage([volume]));
      }),
      http.get('*/account/notifications', () => {
        return HttpResponse.json(makeResourcePage([notification]));
      })
    );

    const { findByText } = renderWithTheme(
      <VolumesUpgradeBanner linodeId={1} />
    );

    await findByText('A Volume attached to this Linode is eligible', {
      exact: false,
    });
  });

  it('should render if there are many upgradable volumes', async () => {
    const volumes = volumeFactory.buildList(5);

    const notifications = [
      notificationFactory.build({
        entity: { id: volumes[0].id, type: 'volume' },
        type: 'volume_migration_scheduled',
      }),
      notificationFactory.build({
        entity: { id: volumes[1].id, type: 'volume' },
        type: 'volume_migration_scheduled',
      }),
    ];

    server.use(
      http.get('*/linode/instances/:id/volumes', () => {
        return HttpResponse.json(makeResourcePage(volumes));
      }),
      http.get('*/account/notifications', () => {
        return HttpResponse.json(makeResourcePage(notifications));
      })
    );

    const { findByText } = renderWithTheme(
      <VolumesUpgradeBanner linodeId={1} />
    );

    await findByText('Volumes attached to this Linode are eligible', {
      exact: false,
    });
  });
});
