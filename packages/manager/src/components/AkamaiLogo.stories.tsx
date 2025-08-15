import React from 'react';

import { AkamaiLogo } from './AkamaiLogo';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof AkamaiLogo> = {
  component: AkamaiLogo,
  title: 'Icons/Akamai Logo',
};

type Story = StoryObj<typeof AkamaiLogo>;

export const Default: Story = {
  args: {
    sx: { width: '200px', height: '75px' },
  },
  render: (args) => <AkamaiLogo {...args} />,
};

export default meta;
