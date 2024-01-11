import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { ImageUploader } from './ImageUploader';

const props = {
  apiError: undefined,
  dropzoneDisabled: false,
  label: 'Upload files here',
  onSuccess: vi.fn(),
  region: 'us-east-1',
  setCancelFn: vi.fn(),
  setErrors: vi.fn(),
};

describe('File Uploader', () => {
  it('properly renders the File Uploader', () => {
    const screen = renderWithTheme(<ImageUploader {...props} />);

    const browseFiles = screen.getByTestId('upload-button');
    expect(browseFiles).toBeVisible();
    expect(browseFiles).toHaveAttribute('aria-disabled', 'false');
    const text = screen.getByText(
      'You can browse your device to upload an image file or drop it here.'
    );
    expect(text).toBeVisible();
  });

  it('disables the dropzone', () => {
    const screen = renderWithTheme(
      <ImageUploader {...props} dropzoneDisabled={true} />
    );

    const browseFiles = screen.getByTestId('upload-button');
    expect(browseFiles).toBeVisible();
    expect(browseFiles).toHaveAttribute('aria-disabled', 'true');

    const text = screen.getByText(
      'To upload an image, complete the required fields.'
    );
    expect(text).toBeVisible();
  });
});
