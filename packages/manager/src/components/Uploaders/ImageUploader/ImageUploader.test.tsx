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

    const browseFiles = screen.getByText('Choose File').closest('button');
    expect(browseFiles).toBeVisible();
    expect(browseFiles).toBeEnabled();

    expect(
      screen.getByText(
        'An image file needs to be raw disk format (.img) that’s compressed using gzip.'
      )
    ).toBeVisible();
    expect(
      screen.getByText(
        'The maximum compressed file size is 5 GB and the file can’t exceed 6 GB when uncompressed.'
      )
    ).toBeVisible();
  });

  it('disables the dropzone', () => {
    const screen = renderWithTheme(<ImageUploader {...props} disabled />);

    const browseFiles = screen.getByText('Choose File').closest('button');
    expect(browseFiles).toBeVisible();
    expect(browseFiles).toBeDisabled();
    expect(browseFiles).toHaveAttribute('aria-disabled', 'true');

    const text = screen.getByText(
      'An image file needs to be raw disk format (.img) that’s compressed using gzip.'
    );
    expect(text).toBeVisible();
  });
});
