import React from 'react';

import { CopyableTextField } from './CopyableTextField';

import type { Meta, StoryFn, StoryObj } from '@storybook/react';

const meta: Meta<typeof CopyableTextField> = {
  args: {
    label: 'Label',
    value: 'Text to copy',
  },
  component: CopyableTextField,
  decorators: [
    (Story: StoryFn) => (
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
