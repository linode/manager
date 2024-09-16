import * as React from 'react';

import { Avatar } from 'src/components/Avatar/Avatar';

import type { Meta, StoryObj } from '@storybook/react';
import type { AvatarProps } from 'src/components/Avatar/Avatar';

export const Default: StoryObj<AvatarProps> = {
  render: (args) => <Avatar {...args} />,
};

export const System: StoryObj<AvatarProps> = {
  render: (args) => <Avatar {...args} username="Linode" />,
};

const meta: Meta<AvatarProps> = {
  args: {
    color: '#0174bc',
    height: 88,
    sx: {},
    username: 'MyUsername',
    width: 88,
  },
  component: Avatar,
  title: 'Components/Avatar',
};
export default meta;
