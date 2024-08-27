import { waitFor } from '@testing-library/react';
import * as React from 'react';

import { accountFactory, volumeFactory } from 'src/factories';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { EditVolumeDrawer } from './EditVolumeDrawer';

const accountEndpoint = '*/v4/account';
const encryptionLabelText = 'Encrypt Volume';

describe('EditVolumeDrawer', () => {
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

    const { getByLabelText } = renderWithTheme(
      <EditVolumeDrawer onClose={vi.fn} open volume={volume} />,
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

    const { queryByRole } = renderWithTheme(
      <EditVolumeDrawer onClose={vi.fn} open volume={volume} />,
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

    const { queryByRole } = renderWithTheme(
      <EditVolumeDrawer onClose={vi.fn} open volume={volume} />,
      {
        flags: { blockStorageEncryption: true },
      }
    );

    await waitFor(() => {
      expect(queryByRole('checkbox')).not.toBeInTheDocument();
    });
  });
});
