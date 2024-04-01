import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { notificationFactory, volumeFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithTheme, wrapWithTableBody } from 'src/utilities/testHelpers';

import { ActionHandlers } from './VolumesActionMenu';
import { VolumeTableRow } from './VolumeTableRow';

const attachedVolume = volumeFactory.build({
  linode_id: 0,
  linode_label: 'thisLinode',
  region: 'us-east',
});

const unattachedVolume = volumeFactory.build({
  linode_id: null,
  linode_label: null,
});

const handlers: ActionHandlers = {
  handleAttach: vi.fn(),
  handleClone: vi.fn(),
  handleDelete: vi.fn(),
  handleDetach: vi.fn(),
  handleDetails: vi.fn(),
  handleEdit: vi.fn(),
  handleResize: vi.fn(),
  handleUpgrade: vi.fn(),
};

describe('Volume table row', () => {
  it("should show the attached Linode's label if present", async () => {
    const { getByLabelText, getByTestId, getByText } = renderWithTheme(
      wrapWithTableBody(
        <VolumeTableRow handlers={handlers} volume={attachedVolume} />
      )
    );

    // Check row for basic values
    expect(getByText(attachedVolume.label));
    expect(getByText(attachedVolume.size, { exact: false }));
    expect(getByTestId('region'));
    expect(getByText(attachedVolume.linode_label!));

    await userEvent.click(getByLabelText(/^Action menu for/));

    // Make sure there is a detach button
    expect(getByText('Detach'));
  });

  it('should show Unattached if the Volume is not attached to a Linode', async () => {
    const { getByLabelText, getByText } = renderWithTheme(
      wrapWithTableBody(
        <VolumeTableRow handlers={handlers} volume={unattachedVolume} />
      )
    );
    expect(getByText('Unattached'));

    await userEvent.click(getByLabelText(/^Action menu for/));

    // Make sure there is an attach button
    expect(getByText('Attach'));
  });

  it('should should render an upgrade chip if the volume is eligible for an upgrade', async () => {
    const volume = volumeFactory.build({ id: 5 });
    const notification = notificationFactory.build({
      entity: { id: volume.id, type: 'volume' },
      type: 'volume_migration_scheduled',
    });

    server.use(
      http.get('*/account/notifications', () => {
        return HttpResponse.json(makeResourcePage([notification]));
      })
    );

    const { findByText } = renderWithTheme(
      wrapWithTableBody(<VolumeTableRow handlers={handlers} volume={volume} />)
    );

    await findByText('UPGRADE TO NVMe');
  });

  it('should should render an "UPGRADE PENDING" chip if the volume upgrade is imminent', async () => {
    const volume = volumeFactory.build({ id: 5 });
    const notification = notificationFactory.build({
      entity: { id: volume.id, type: 'volume' },
      type: 'volume_migration_imminent',
    });

    server.use(
      http.get('*/account/notifications', () => {
        return HttpResponse.json(makeResourcePage([notification]));
      })
    );

    const { findByText } = renderWithTheme(
      wrapWithTableBody(<VolumeTableRow handlers={handlers} volume={volume} />)
    );

    await findByText('UPGRADE PENDING');
  });
});

describe('Volume table row - for linodes detail page', () => {
  it("should show the attached Linode's label if present", async () => {
    const {
      getByLabelText,
      getByText,
      queryByTestId,
      queryByText,
    } = renderWithTheme(
      wrapWithTableBody(
        <VolumeTableRow
          handlers={handlers}
          isDetailsPageRow
          volume={attachedVolume}
        />
      )
    );

    // Check row for basic values
    expect(getByText(attachedVolume.label));
    expect(getByText(attachedVolume.size, { exact: false }));

    // Because we are on a Linode details page that has the region, we don't need to show
    // the volume's region. A Volume attached to a Linode must be in the same region.
    expect(queryByTestId('region')).toBeNull();

    // Because we are on a Linode details page, we don't need to show the Linode label
    expect(queryByText(attachedVolume.linode_label!)).toBeNull();

    await userEvent.click(getByLabelText(/^Action menu for/));

    // Make sure there is a detach button
    expect(getByText('Detach'));
  });
});
