import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { DownloadTooltip } from './DownloadTooltip';

const meta: Meta<typeof DownloadTooltip> = {
  title: 'Components/Tooltip/Download Tooltip',
  component: DownloadTooltip,
};

type Story = StoryObj<typeof DownloadTooltip>;

export const Default: Story = {
  render: (args) => <DownloadTooltip {...args} />,
  args: {
    text: 'This is a DownloadTooltip',
  },
};

export default meta;
