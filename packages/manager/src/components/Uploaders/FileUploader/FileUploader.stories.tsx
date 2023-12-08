import * as React from 'react';

import { FileUploader } from './FileUploader';

import type { Meta, StoryObj } from '@storybook/react';

/**
 * This component enables users to attach and upload custom Images.
 */
export const ImageUploader: StoryObj<typeof FileUploader> = {
  args: {
    apiError: undefined,
    description: 'My Ubuntu Image for Production',
    dropzoneDisabled: false,
    label: 'file upload',
    onSuccess: undefined,
    region: 'us-east-1',
    setCancelFn: undefined,
    setErrors: undefined,
  },
  render: (args) => {
    return <FileUploader {...args} />;
  },
};

const meta: Meta<typeof FileUploader> = {
  component: FileUploader,
  title: 'Components/File Uploader/Image Uploader',
};

export default meta;
