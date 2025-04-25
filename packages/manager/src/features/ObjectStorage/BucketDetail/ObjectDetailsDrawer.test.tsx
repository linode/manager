import { profileFactory } from '@linode/utilities';
import { screen, waitFor } from '@testing-library/react';
import * as React from 'react';

import { http, HttpResponse, server } from 'src/mocks/testServer';
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
    renderWithTheme(<ObjectDetailsDrawer {...props} />);

    // The date rendering depends on knowing the profile timezone
    await expect(
      screen.findByText(/^Last modified: 2019-12-31/)
    ).resolves.toBeInTheDocument();

    expect(screen.getByText(/^https:\/\/my-bucket/)).toBeVisible();
  });

  it("doesn't show last modified if the the time is invalid", async () => {
    renderWithTheme(
      <ObjectDetailsDrawer {...props} lastModified="INVALID DATE" />
    );

    await waitFor(() => {
      expect(() => screen.getByTestId('lastModified')).toThrow();
    });
  });

  describe('readableBytes edge cases in Object Storage', () => {
    it('displays bytes correctly for sizes under 1 KB threshold', () => {
      renderWithTheme(<ObjectDetailsDrawer {...props} size={1000} />);

      // Values under 1024 bytes should remain as bytes
      expect(screen.getByText('1000 bytes')).toBeVisible();
    });

    it('uses base2 calculations (1024-based) for KB display', () => {
      renderWithTheme(<ObjectDetailsDrawer {...props} size={1024} />);

      // 1024 bytes = 1 KB in base2 (not 1.02 KB as it would be in base10)
      expect(screen.getByText('1 KB')).toBeVisible();
    });

    it('converts base10 MB values correctly to base2 display', () => {
      renderWithTheme(<ObjectDetailsDrawer {...props} size={1000000} />);

      // 1,000,000 bytes / 1024 = 976.56 KB (rounded to 977 KB)
      // Since this is less than 1 MB in base2, it displays as KB
      expect(screen.getByText('977 KB')).toBeVisible();
    });
  });
});
