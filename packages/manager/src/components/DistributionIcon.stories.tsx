import * as React from 'react';

import { DistributionIcon } from './DistributionIcon';

import type { Meta, StoryObj } from '@storybook/react';

export const Default: StoryObj<typeof DistributionIcon> = {
  render: (args) => <DistributionIcon {...args} />,
};

export const Ubuntu: StoryObj<typeof DistributionIcon> = {
  render: () => <DistributionIcon distribution="Ubuntu" />,
};

export const Debian: StoryObj<typeof DistributionIcon> = {
  render: () => <DistributionIcon distribution="Debian" />,
};

export const Alpine: StoryObj<typeof DistributionIcon> = {
  render: () => <DistributionIcon distribution="Alpine" />,
};

const meta: Meta<typeof DistributionIcon> = {
  component: DistributionIcon,
  title: 'Components/Distribution Icon',
};

export default meta;
