import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { ImageUploader } from './ImageUploader';

const props = {
  isUploading: false,
  progress: undefined,
};

describe('File Uploader', () => {
  it('properly renders the File Uploader', () => {
    const screen = renderWithTheme(<ImageUploader {...props} />);

    const browseFiles = screen.getByText('Browse Files').closest('button');
    expect(browseFiles).toBeVisible();
    expect(browseFiles).toBeEnabled();
    const text = screen.getByText(
      'You can browse your device to upload an image file or drop it here.'
    );
    expect(text).toBeVisible();
  });

  it('disables the dropzone', () => {
    const screen = renderWithTheme(<ImageUploader {...props} disabled />);

    const browseFiles = screen.getByText('Browse Files').closest('button');
    expect(browseFiles).toBeVisible();
    expect(browseFiles).toBeDisabled();
    expect(browseFiles).toHaveAttribute('aria-disabled', 'true');

    const text = screen.getByText(
      'You can browse your device to upload an image file or drop it here.'
    );
    expect(text).toBeVisible();
  });
});
