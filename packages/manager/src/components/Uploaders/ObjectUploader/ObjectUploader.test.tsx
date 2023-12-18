import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { ObjectUploader } from './ObjectUploader';

const props = {
  bucketName: 'my-bucket',
  clusterId: 'us-east',
  maybeAddObjectToTable: vi.fn(),
  prefix: '/',
};

describe('Object Uploader', () => {
  it('properly renders the Object Uploader', () => {
    const screen = renderWithTheme(<ObjectUploader {...props} />);

    const btn = screen.getByText('Browse Files');
    expect(btn).toBeVisible();
    const text = screen.getByText(
      'You can browse your device to upload files or drop them here.'
    );
    expect(text).toBeVisible();
  });
});
