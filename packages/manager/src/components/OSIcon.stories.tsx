import * as React from 'react';

import { OSIcon } from './OSIcon';

import type { Meta, StoryObj } from '@storybook/react';

export const Default: StoryObj<typeof OSIcon> = {
  render: (args) => <OSIcon {...args} />,
};

export const Ubuntu: StoryObj<typeof OSIcon> = {
  render: () => <OSIcon os="Ubuntu" />,
};

export const Debian: StoryObj<typeof OSIcon> = {
  render: () => <OSIcon os="Debian" />,
};

export const Alpine: StoryObj<typeof OSIcon> = {
  render: () => <OSIcon os="Alpine" />,
};

const meta: Meta<typeof OSIcon> = {
  component: OSIcon,
  title: 'Icons/OS Icon',
};

export default meta;
