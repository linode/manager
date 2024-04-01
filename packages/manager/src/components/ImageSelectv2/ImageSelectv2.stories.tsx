import * as React from 'react';

import { ImageSelectv2 } from './ImageSelectv2';

import type { Meta, StoryObj } from '@storybook/react';

export const Default: StoryObj<typeof ImageSelectv2> = {
  render: (args) => <ImageSelectv2 {...args} />,
};

const meta: Meta<typeof ImageSelectv2> = {
  component: ImageSelectv2,
  title: 'Components/Selects/Image Select',
};

export default meta;
