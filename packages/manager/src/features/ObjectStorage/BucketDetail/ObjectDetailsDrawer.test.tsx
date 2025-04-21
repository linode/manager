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

  it('uses base2 calculations for storage size display (displaying GB but representing GiB)', async () => {
    const propsWithExactKB = {
      ...props,
      size: 1024,
    };

    renderWithTheme(<ObjectDetailsDrawer {...propsWithExactKB} />);

    // 1024 bytes should display as exactly "1 KB" in base2 (not "1.02 KB" as it would in base10)
    expect(screen.getByText('1 KB')).toBeVisible();
  });

  it("doesn't show last modified if the the time is invalid", async () => {
    renderWithTheme(
      <ObjectDetailsDrawer {...props} lastModified="INVALID DATE" />
    );

    await waitFor(() => {
      expect(() => screen.getByTestId('lastModified')).toThrow();
    });
  });
});
