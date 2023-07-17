import * as React from 'react';

import { rest, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { BucketSSL } from './BucketSSL';

describe('BucketSSL', () => {
  it('renders inputs for a Certificate and Private Key when no cert is set', async () => {
    server.use(
      rest.get('*object-storage/buckets/*/*/ssl', (req, res, ctx) => {
        return res(ctx.json({ ssl: false }));
      })
    );

    const { findByLabelText, getByText } = renderWithTheme(
      <BucketSSL bucketName="test" clusterId="test" />
    );

    await findByLabelText('Certificate');
    await findByLabelText('Private Key');

    expect(getByText('Upload Certificate')).toBeVisible();
  });

  it('renders a notice and a remove button when certs are already set', async () => {
    server.use(
      rest.get('*object-storage/buckets/*/*/ssl', (req, res, ctx) => {
        return res(ctx.json({ ssl: true }));
      })
    );

    const { findByText, getByText } = renderWithTheme(
      <BucketSSL bucketName="test" clusterId="test" />
    );

    await findByText(
      'A TLS certificate has already been uploaded for this Bucket. To upload a new certificate, remove the current certificate.'
    );

    expect(getByText('Remove Certificate')).toBeVisible();
  });
});
