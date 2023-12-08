import * as React from 'react';

import { ObjectUploader } from './ObjectUploader';

import type { Meta, StoryObj } from '@storybook/react';

/**
 * This component enables users to attach and upload files to be stored in Object Storage.
 */
export const ObjectUpload: StoryObj<typeof ObjectUploader> = {
  args: {
    bucketName: 'my-bucket',
    clusterId: 'us-east',
    maybeAddObjectToTable: () => null,
    prefix: '/',
  },
  render: (args) => {
    return <ObjectUploader {...args} />;
  },
};

const meta: Meta<typeof ObjectUploader> = {
  component: ObjectUploader,
  title: 'Components/File Uploader/Object Uploader',
};

export default meta;
