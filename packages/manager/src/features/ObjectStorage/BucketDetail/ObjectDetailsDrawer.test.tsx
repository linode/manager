import { profileFactory } from '@linode/utilities';
import { act, waitFor } from '@testing-library/react';
import * as React from 'react';

import { HttpResponse, http, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { ObjectDetailsDrawer } from './ObjectDetailsDrawer';

import type { ObjectDetailsDrawerProps } from './ObjectDetailsDrawer';

vi.mock('@linode/api-v4/lib/object-storage/objects', async () => {
  const actual = await vi.importActual<any>(
    '@linode/api-v4/lib/object-storage/objects'
  );
  return {
    ...actual,
    getObjectACL: vi.fn().mockResolvedValue({
      acl: 'public-read',
      acl_xml: 'long xml string',
    }),
    updateObjectACL: vi.fn().mockResolvedValue({}),
  };
});

const props: ObjectDetailsDrawerProps = {
  bucketName: 'my-bucket',
  clusterId: 'cluster-id',
  displayName: 'my-image.png',
  lastModified: '2019-12-31T23:59:59Z',
  name: 'my-dir/my-image.png',
  onClose: vi.fn(),
  open: true,
  size: 12345,
  url: 'https://my-bucket.cluster-id.linodeobjects.com/my-image.png',
};

describe('ObjectDetailsDrawer', () => {
  it('renders formatted size, formatted last modified, truncated URL', async () => {
    server.use(
      http.get('*/profile', () =>
        HttpResponse.json(profileFactory.build({ timezone: 'utc' }))
      )
    );
    const { getByText } = renderWithTheme(<ObjectDetailsDrawer {...props} />);

    // The date rendering depends on knowing the profile timezone
    await waitFor(() =>
      expect(getByText(/^Last modified: 2019-12-31/)).toBeInTheDocument()
    );

    expect(getByText('12.3 KB')).toBeInTheDocument();
    expect(getByText(/^https:\/\/my-bucket/)).toBeInTheDocument();
  });

  it("doesn't show last modified if the the time is invalid", async () => {
    const { queryByTestId } = renderWithTheme(
      <ObjectDetailsDrawer {...props} lastModified="INVALID DATE" />
    );

    await act(async () => {
      expect(queryByTestId('lastModified')).not.toBeInTheDocument();
    });
  });

  it("doesn't show the ACL Switch for E2 and E3 buckets", async () => {
    const { queryByLabelText } = renderWithTheme(
      <ObjectDetailsDrawer {...props} endpointType="E3" />
    );
    await waitFor(() => {
      expect(
        queryByLabelText('Access Control List (ACL)')
      ).not.toBeInTheDocument();
    });
  });
});
