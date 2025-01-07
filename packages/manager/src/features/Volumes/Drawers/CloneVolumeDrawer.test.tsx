import { waitFor } from '@testing-library/react';
import * as React from 'react';

import { accountFactory, volumeFactory } from 'src/factories';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { renderWithThemeAndRouter } from 'src/utilities/testHelpers';

import { CloneVolumeDrawer } from './CloneVolumeDrawer';

const accountEndpoint = '*/v4/account';
const encryptionLabelText = 'Encrypt Volume';

describe('CloneVolumeDrawer', () => {
  /* @TODO BSE: Remove feature flagging/conditionality once BSE is fully rolled out */

  it('should display a disabled checkbox for volume encryption if the user has the account capability and the feature flag is on', async () => {
    const volume = volumeFactory.build();

    server.use(
      http.get(accountEndpoint, () => {
        return HttpResponse.json(
          accountFactory.build({ capabilities: ['Block Storage Encryption'] })
        );
      })
    );

    const { getByLabelText } = await renderWithThemeAndRouter(
      <CloneVolumeDrawer onClose={vi.fn} open volume={volume} />,
      {
        flags: { blockStorageEncryption: true },
      }
    );

    await waitFor(() => {
      expect(getByLabelText(encryptionLabelText)).not.toBeNull();
      expect(getByLabelText(encryptionLabelText)).toBeDisabled();
    });
  });

  it('should not display a checkbox for volume encryption if the user has the account capability but the feature flag is off', async () => {
    const volume = volumeFactory.build();

    server.use(
      http.get(accountEndpoint, () => {
        return HttpResponse.json(
          accountFactory.build({ capabilities: ['Block Storage Encryption'] })
        );
      })
    );

    const { queryByRole } = await renderWithThemeAndRouter(
      <CloneVolumeDrawer onClose={vi.fn} open volume={volume} />,
      {
        flags: { blockStorageEncryption: false },
      }
    );

    await waitFor(() => {
      expect(queryByRole('checkbox')).not.toBeInTheDocument();
    });
  });

  it('should not display a checkbox for volume encryption if the feature flag is on but the user lacks the account capability', async () => {
    const volume = volumeFactory.build();

    server.use(
      http.get(accountEndpoint, () => {
        return HttpResponse.json(accountFactory.build({ capabilities: [] }));
      })
    );

    const { queryByRole } = await renderWithThemeAndRouter(
      <CloneVolumeDrawer onClose={vi.fn} open volume={volume} />,
      {
        flags: { blockStorageEncryption: true },
      }
    );

    await waitFor(() => {
      expect(queryByRole('checkbox')).not.toBeInTheDocument();
    });
  });
});
