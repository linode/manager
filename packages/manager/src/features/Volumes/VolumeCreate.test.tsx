import * as React from 'react';

import { accountFactory } from 'src/factories';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { renderWithThemeAndRouter } from 'src/utilities/testHelpers';

import { VolumeCreate } from './VolumeCreate';

const accountEndpoint = '*/v4/account';
const encryptVolumeSectionHeader = 'Encrypt Volume';

describe('VolumeCreate', () => {
  /* @TODO BSE: Remove feature flagging/conditionality once BSE is fully rolled out */

  it('should not have a "Volume Encryption" section visible if the user has the account capability but the feature flag is off', async () => {
    server.use(
      http.get(accountEndpoint, () => {
        return HttpResponse.json(
          accountFactory.build({ capabilities: ['Block Storage Encryption'] })
        );
      })
    );

    const { queryByText } = await renderWithThemeAndRouter(<VolumeCreate />, {
      flags: { blockStorageEncryption: false },
    });

    expect(queryByText(encryptVolumeSectionHeader)).not.toBeInTheDocument();
  });

  it('should not have a "Volume Encryption" section visible if the user does not have the account capability but the feature flag is on', async () => {
    server.use(
      http.get(accountEndpoint, () => {
        return HttpResponse.json(accountFactory.build({ capabilities: [] }));
      })
    );

    const { queryByText } = await renderWithThemeAndRouter(<VolumeCreate />, {
      flags: { blockStorageEncryption: true },
    });

    expect(queryByText(encryptVolumeSectionHeader)).not.toBeInTheDocument();
  });

  it('should have a "Volume Encryption" section visible if feature flag is on and user has the capability', async () => {
    server.use(
      http.get(accountEndpoint, () => {
        return HttpResponse.json(
          accountFactory.build({ capabilities: ['Block Storage Encryption'] })
        );
      })
    );

    const { findByText } = await renderWithThemeAndRouter(<VolumeCreate />, {
      flags: { blockStorageEncryption: true },
    });

    await findByText(encryptVolumeSectionHeader);
  });
});
