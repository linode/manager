import React from 'react';

import { CopyableTextField } from './CopyableTextField';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof CopyableTextField> = {
  args: {
    label: 'Label',
    value: 'Text to copy',
  },
  component: CopyableTextField,
  decorators: [
    (Story) => (
      <div style={{ margin: '1em' }}>
        <Story />
      </div>
    ),
  ],
  title: 'Components/Input/CopyableTextField',
};

export default meta;

type Story = StoryObj<typeof CopyableTextField>;

export const Default: Story = {
  render: (args) => <CopyableTextField {...args} />,
};
