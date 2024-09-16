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

    expect(getByTestId('drawer-title')).toBeVisible();
    expect(getByText('Label')).toBeVisible();
    expect(getByText('Region')).toBeVisible();
    expect(getByText('Cancel')).toBeVisible();
    expect(getByTestId('create-bucket-button')).toBeVisible();
    expect(queryByText('Object Storage Endpoint Type')).not.toBeInTheDocument();
  });

  it(
    'should not display the endpoint selector if regions is not selected',
    server.boundary(async () => {
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

      const { queryByText } = renderWithThemeAndHookFormContext({
        component: <OMC_CreateBucketDrawer {...props} />,
        options: {
          flags: {
            objMultiCluster: true,
            objectStorageGen2: { enabled: true },
          },
        },
      });

      expect(
        queryByText('Object Storage Endpoint Type')
      ).not.toBeInTheDocument();
    })
  );

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
