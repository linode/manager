import * as React from 'react';

import { accountFactory, linodeFactory, volumeFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { LinodeVolumes } from './LinodeVolumes';

const accountEndpoint = '*/v4/account';
const linodeInstanceEndpoint = '*/linode/instances/:id';
const linodeVolumesEndpoint = '*/linode/instances/:id/volumes';

describe('LinodeVolumes', () => {
  const volumes = volumeFactory.buildList(3);

  it('should render', async () => {
    server.use(
      http.get(linodeInstanceEndpoint, () => {
        return HttpResponse.json(linodeFactory.build());
      }),
      http.get(linodeVolumesEndpoint, () => {
        return HttpResponse.json(makeResourcePage(volumes));
      })
    );

    const { findByText } = renderWithTheme(<LinodeVolumes />);

    expect(await findByText('Volumes')).toBeVisible();
  });

  /* @TODO BSE: Remove feature flagging/conditionality once BSE is fully rolled out */
  it('should display an "Encryption" column if the user has the account capability and the feature flag is on', async () => {
    server.use(
      http.get(accountEndpoint, () => {
        return HttpResponse.json(
          accountFactory.build({
            capabilities: ['Block Storage Encryption'],
          })
        );
      })
    );

    server.use(
      http.get(linodeInstanceEndpoint, () => {
        return HttpResponse.json(linodeFactory.build());
      }),
      http.get(linodeVolumesEndpoint, () => {
        return HttpResponse.json(makeResourcePage(volumes));
      })
    );

    const { findByText } = renderWithTheme(<LinodeVolumes />, {
      flags: { blockStorageEncryption: true },
    });

    expect(await findByText('Encryption')).toBeVisible();
  });

  it('should not display an "Encryption" column if the user has the account capability but the feature flag is off', async () => {
    server.use(
      http.get(accountEndpoint, () => {
        return HttpResponse.json(
          accountFactory.build({
            capabilities: ['Block Storage Encryption'],
          })
        );
      })
    );

    server.use(
      http.get(linodeInstanceEndpoint, () => {
        return HttpResponse.json(linodeFactory.build());
      }),
      http.get(linodeVolumesEndpoint, () => {
        return HttpResponse.json(makeResourcePage(volumes));
      })
    );

    const { queryByText } = renderWithTheme(<LinodeVolumes />, {
      flags: { blockStorageEncryption: false },
    });

    expect(queryByText('Encryption')).toBeNull();
  });

  it('should not display an "Encryption" column if the feature flag is on but the user does not have the account capability', async () => {
    server.use(
      http.get(accountEndpoint, () => {
        return HttpResponse.json(
          accountFactory.build({
            capabilities: [],
          })
        );
      })
    );

    server.use(
      http.get(linodeInstanceEndpoint, () => {
        return HttpResponse.json(linodeFactory.build());
      }),
      http.get(linodeVolumesEndpoint, () => {
        return HttpResponse.json(makeResourcePage(volumes));
      })
    );

    const { queryByText } = renderWithTheme(<LinodeVolumes />, {
      flags: { blockStorageEncryption: true },
    });

    expect(queryByText('Encryption')).toBeNull();
  });
});
