import React from 'react';

import { notificationFactory, volumeFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { rest, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import {
  VolumesUpgradeBanner,
  getUpgradeableVolumeIds,
} from './VolumesUpgradeBanner';

describe('VolumesUpgradeBanner', () => {
  it('should render if there is an upgradable volume', async () => {
    const volume = volumeFactory.build();
    const notification = notificationFactory.build({
      entity: { id: volume.id, type: 'volume' },
      type: 'volume_migration_scheduled',
    });

    server.use(
      rest.get('*/linode/instances/:id/volumes', (req, res, ctx) => {
        return res(ctx.json(makeResourcePage([volume])));
      }),
      rest.get('*/account/notifications', (req, res, ctx) => {
        return res(ctx.json(makeResourcePage([notification])));
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
      rest.get('*/linode/instances/:id/volumes', (req, res, ctx) => {
        return res(ctx.json(makeResourcePage(volumes)));
      }),
      rest.get('*/account/notifications', (req, res, ctx) => {
        return res(ctx.json(makeResourcePage(notifications)));
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

describe('getUpgradeableVolumeIds', () => {
  it('should return the id of volumes that have a corosponding upgrade notification', () => {
    const volumes = [
      volumeFactory.build({ id: 1 }),
      volumeFactory.build({ id: 2 }),
      volumeFactory.build({ id: 3 }),
    ];

    const notifications = [
      notificationFactory.build({
        entity: { id: 1 },
        type: 'volume_migration_scheduled',
      }),
      notificationFactory.build({
        entity: { id: 3 },
        type: 'volume_migration_scheduled',
      }),
    ];

    expect(getUpgradeableVolumeIds(volumes, notifications)).toStrictEqual([
      1,
      3,
    ]);
  });

  it('should return an empty array given empty data', () => {
    expect(getUpgradeableVolumeIds([], [])).toStrictEqual([]);
  });
});
