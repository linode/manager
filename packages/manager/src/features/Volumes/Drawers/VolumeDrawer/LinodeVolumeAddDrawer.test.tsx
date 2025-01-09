import { waitFor } from '@testing-library/react';
import * as React from 'react';

import { accountFactory, linodeFactory } from 'src/factories';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { renderWithThemeAndRouter } from 'src/utilities/testHelpers';

import { LinodeVolumeAddDrawer } from './LinodeVolumeAddDrawer';

const accountEndpoint = '*/v4/account';
const encryptionLabelText = 'Encrypt Volume';

describe('LinodeVolumeAddDrawer', () => {
  /* @TODO BSE: Remove feature flagging/conditionality once BSE is fully rolled out */

  it('should display a "Volume Encryption" section if the user has the account capability and the feature flag is on', async () => {
    const linode = linodeFactory.build();

    server.use(
      http.get(accountEndpoint, () => {
        return HttpResponse.json(
          accountFactory.build({ capabilities: ['Block Storage Encryption'] })
        );
      })
    );

    const { getByLabelText } = await renderWithThemeAndRouter(
      <LinodeVolumeAddDrawer
        linode={linode}
        onClose={vi.fn}
        open
        openDetails={() => vi.fn}
      />,
      {
        flags: { blockStorageEncryption: true },
      }
    );

    await waitFor(() => {
      expect(getByLabelText(encryptionLabelText)).not.toBeNull();
    });
  });
});
