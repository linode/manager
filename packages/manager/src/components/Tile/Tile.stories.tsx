import React from 'react';

import Chat from 'src/assets/icons/chat.svg';
import { Tile } from 'src/components/Tile/Tile';

import type { TileProps } from './Tile';
import type { Meta, StoryObj } from '@storybook/react';

export const Default: StoryObj<TileProps> = {
  render: (args) => <Tile {...args} />,
};

const meta: Meta<TileProps> = {
  args: {
    description:
      'In order to make the tile a link, the link prop needs to be set. It can be either an internal or external link, or an onClick function',
    errorText: undefined,
    icon: <Chat />,
    link: 'http://cloud.linode.com',
    title: 'This is the Tile title',
  },
  component: Tile,
  title: 'Components/Tile',
};

export default meta;
