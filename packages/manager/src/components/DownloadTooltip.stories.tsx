import React from 'react';

import { DownloadTooltip } from './DownloadTooltip';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof DownloadTooltip> = {
  component: DownloadTooltip,
  title: 'Components/Tooltip/Download Tooltip',
};

type Story = StoryObj<typeof DownloadTooltip>;

export const Default: Story = {
  args: {
    text: 'This is a DownloadTooltip',
  },
  render: (args) => <DownloadTooltip {...args} />,
};

export default meta;
