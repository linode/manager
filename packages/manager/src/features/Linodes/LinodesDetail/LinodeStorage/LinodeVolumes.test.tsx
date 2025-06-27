import { linodeFactory } from '@linode/utilities';
import * as React from 'react';

import { accountFactory, volumeFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithThemeAndRouter } from 'src/utilities/testHelpers';

import { LinodeVolumes } from './LinodeVolumes';

const accountEndpoint = '*/v4/account';
const linodeInstanceEndpoint = '*/linode/instances/:id';
const linodeVolumesEndpoint = '*/linode/instances/:id/volumes';

const queryMocks = vi.hoisted(() => ({
  useNavigate: vi.fn(),
  useParams: vi.fn(),
  useSearch: vi.fn(),
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useNavigate: queryMocks.useNavigate,
    useSearch: queryMocks.useSearch,
    useParams: queryMocks.useParams,
  };
});

describe('LinodeVolumes', async () => {
  beforeEach(() => {
    queryMocks.useNavigate.mockReturnValue(vi.fn());
    queryMocks.useSearch.mockReturnValue({});
    queryMocks.useParams.mockReturnValue({});
  });

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

    const { findByText } = await renderWithThemeAndRouter(<LinodeVolumes />);

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

    const { findByText } = await renderWithThemeAndRouter(<LinodeVolumes />, {
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

    const { queryByText } = await renderWithThemeAndRouter(<LinodeVolumes />, {
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

    const { queryByText } = await renderWithThemeAndRouter(<LinodeVolumes />, {
      flags: { blockStorageEncryption: true },
    });

    expect(queryByText('Encryption')).toBeNull();
  });
});
