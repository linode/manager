import * as React from 'react';

import { ImageSelect } from './ImageSelect';

import type { Meta, StoryObj } from '@storybook/react';

export const Default: StoryObj<typeof ImageSelect> = {
  render: (args) => <ImageSelect {...args} />,
};

const meta: Meta<typeof ImageSelect> = {
  component: ImageSelect,
  title: 'Components/Selects/Image Select',
};

export default meta;
