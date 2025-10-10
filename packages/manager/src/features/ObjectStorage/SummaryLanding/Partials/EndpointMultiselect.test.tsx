import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { EndpointMultiselect } from './EndpointMultiselect';

import type { EndpointMultiselectValue } from './EndpointMultiselect';

const queryMocks = vi.hoisted(() => ({
  useObjectStorageEndpoints: vi.fn().mockReturnValue([]),
}));

vi.mock('src/queries/object-storage/queries', async () => {
  const actual = await vi.importActual('src/queries/object-storage/queries');
  return {
    ...actual,
    useObjectStorageEndpoints: queryMocks.useObjectStorageEndpoints,
  };
});

const endpointsMock = [
  {
    region: 'br-gru',
    endpoint_type: 'E1',
    s3_endpoint: 'br-gru-1.linodeobjects.com',
  },
  {
    region: 'es-mad',
    endpoint_type: 'E1',
    s3_endpoint: 'es-mad-1.linodeobjects.com',
  },
  {
    region: 'gb-lon',
    endpoint_type: 'E3',
    s3_endpoint: null,
  },
];

const onChangeMock = vi.fn();

describe('EndpointMultiselect', () => {
  it('should show loading text while fetching endpoints', async () => {
    queryMocks.useObjectStorageEndpoints.mockReturnValue({
      data: [],
      isFetching: true,
    });

    const selectedEndpoints: EndpointMultiselectValue[] = [];

    const { getByPlaceholderText } = renderWithTheme(
      <EndpointMultiselect onChange={onChangeMock} values={selectedEndpoints} />
    );

    expect(getByPlaceholderText('Loading S3 endpoints...')).toBeVisible();
  });

  it('should show proper placeholder after fetching endpoints', async () => {
    queryMocks.useObjectStorageEndpoints.mockReturnValue({
      data: endpointsMock,
      isFetching: false,
    });

    const selectedEndpoints: EndpointMultiselectValue[] = [];

    const { getByPlaceholderText } = renderWithTheme(
      <EndpointMultiselect onChange={onChangeMock} values={selectedEndpoints} />
    );

    expect(
      getByPlaceholderText('Select an Object Storage S3 endpoint')
    ).toBeVisible();
  });
});
