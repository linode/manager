import { fireEvent } from '@testing-library/react';
import * as React from 'react';

import { objectStorageEndpointsFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { OMC_CreateBucketDrawer } from './OMC_CreateBucketDrawer';

const props = {
  isOpen: true,
  onClose: vi.fn(),
};

describe('OMC_CreateBucketDrawer', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should render the drawer', () => {
    const {
      getByTestId,
      getByText,
      queryByText,
    } = renderWithThemeAndHookFormContext({
      component: <OMC_CreateBucketDrawer {...props} />,
      options: {
        flags: {
          objMultiCluster: true,
          objectStorageGen2: { enabled: true },
        },
      },
    });

    const header = getByTestId('drawer-title');
    expect(header).toBeVisible();
    const label = getByText('Label');
    expect(label).toBeVisible();
    const region = getByText('Region');
    expect(region).toBeVisible();
    const cancelButton = getByText('Cancel');
    expect(cancelButton).toBeVisible();
    const createButton = getByTestId('create-bucket-button');
    expect(createButton).toBeVisible();
    const endpointType = queryByText('Object Storage Endpoint Type');
    expect(endpointType).not.toBeInTheDocument();
  });

  it('should display the endpoint selector if endpoints exist', async () => {
    server.use(
      http.get('*/v4/object-storage/endpoints', () => {
        return HttpResponse.json(
          makeResourcePage([
            objectStorageEndpointsFactory.build({
              endpoint_type: 'E0',
              region: 'us-sea',
              s3_endpoint: null,
            }),
          ])
        );
      })
    );

    const { findByText } = renderWithThemeAndHookFormContext({
      component: <OMC_CreateBucketDrawer {...props} />,
      options: {
        flags: {
          objMultiCluster: true,
          objectStorageGen2: { enabled: true },
        },
      },
    });

    const endpointType = await findByText('Object Storage Endpoint Type');
    expect(endpointType).toBeVisible();
  });

  it('should close the drawer', () => {
    const { getByText } = renderWithThemeAndHookFormContext({
      component: <OMC_CreateBucketDrawer {...props} />,
    });

    const cancelButton = getByText('Cancel');
    expect(cancelButton).toBeVisible();
    fireEvent.click(cancelButton);
    expect(props.onClose).toHaveBeenCalled();
  });
});
