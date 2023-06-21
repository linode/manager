import { vi } from 'vitest';
import * as React from 'react';
import { act, waitFor } from '@testing-library/react';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { ObjectDetailsDrawer } from './ObjectDetailsDrawer';
import { rest, server } from 'src/mocks/testServer';
import { profileFactory } from 'src/factories';
import { QueryClient } from 'react-query';
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

vi.mock('src/components/EnhancedSelect/Select');

const props: ObjectDetailsDrawerProps = {
  onClose: vi.fn(),
  open: true,
  lastModified: '2019-12-31T23:59:59Z',
  displayName: 'my-image.png',
  name: 'my-dir/my-image.png',
  size: 12345,
  url: 'https://my-bucket.cluster-id.linodeobjects.com/my-image.png',
  bucketName: 'my-bucket',
  clusterId: 'cluster-id',
};

describe('ObjectDetailsDrawer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('renders formatted size, formatted last modified, truncated URL', async () => {
    server.use(
      rest.get('*/profile', (req, res, ctx) =>
        res(ctx.json(profileFactory.build({ timezone: 'utc' })))
      )
    );
    const { getByText } = renderWithTheme(<ObjectDetailsDrawer {...props} />, {
      queryClient: new QueryClient(),
    });

    // The date rendering depends on knowing the profile timezone
    await waitFor(() =>
      expect(getByText(/^Last modified: 2019-12-31/)).toBeInTheDocument()
    );

    expect(getByText('12.1 KB')).toBeInTheDocument();
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
});
