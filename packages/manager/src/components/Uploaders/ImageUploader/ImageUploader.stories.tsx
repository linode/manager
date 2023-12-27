import * as React from 'react';

import { ImageUploader } from './ImageUploader';

import type { Meta, StoryObj } from '@storybook/react';

/**
 * This component enables users to attach and upload custom Images.
 */
export const _ImageUploader: StoryObj<typeof ImageUploader> = {
  args: {
    description: 'My Ubuntu Image for Production',
    dropzoneDisabled: false,
    label: 'file upload',
    region: 'us-east-1',
  },
  render: (args) => {
    return <ImageUploader {...args} />;
  },
};

const meta: Meta<typeof ImageUploader> = {
  component: ImageUploader,
  title: 'Components/File Uploaders/Image Uploader',
};

export default meta;
