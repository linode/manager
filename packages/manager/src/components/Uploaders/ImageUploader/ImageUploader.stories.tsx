import * as React from 'react';

import { ImageUploader } from './ImageUploader';

import type { Meta, StoryObj } from '@storybook/react';

/**
 * This component enables users to attach and upload custom Images.
 */
export const _ImageUploader: StoryObj<typeof ImageUploader> = {
  args: {
    isUploading: false,
    progress: undefined,
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
