import React from 'react';

import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { ImageUploadCLIDialog } from './ImageUploadCLIDialog';

import type { ImageUploadFormData } from './ImageUpload.utils';

describe('ImageUploadCLIDialog', () => {
  it('should render a title', () => {
    const { getByText } = renderWithThemeAndHookFormContext({
      component: <ImageUploadCLIDialog isOpen onClose={vi.fn()} />,
    });

    expect(getByText('Upload Image with the Linode CLI')).toBeVisible();
  });

  it('should render nothing when isOpen is false', () => {
    const { container } = renderWithThemeAndHookFormContext({
      component: <ImageUploadCLIDialog isOpen={false} onClose={vi.fn()} />,
    });

    expect(container).toBeEmptyDOMElement();
  });

  it('should render a default CLI command with no form data', () => {
    const { getByDisplayValue } = renderWithThemeAndHookFormContext({
      component: <ImageUploadCLIDialog isOpen onClose={vi.fn()} />,
    });

    expect(
      getByDisplayValue(
        'linode-cli image-upload --label [LABEL] --description [DESCRIPTION] --region [REGION] FILE'
      )
    ).toBeVisible();
  });

  it('should render a CLI command based on form data', () => {
    const {
      getByDisplayValue,
    } = renderWithThemeAndHookFormContext<ImageUploadFormData>({
      component: <ImageUploadCLIDialog isOpen onClose={vi.fn()} />,
      useFormOptions: {
        defaultValues: {
          description: 'this is my cool image',
          label: 'my-image',
          region: 'us-east',
        },
      },
    });

    expect(
      getByDisplayValue(
        'linode-cli image-upload --label "my-image" --description "this is my cool image" --region "us-east" FILE'
      )
    ).toBeVisible();
  });
});
