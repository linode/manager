import React from 'react';

import { Typography } from '../Typography';
import { MaskableText } from './MaskableText';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof MaskableText> = {
  component: MaskableText,
  title: 'Components/MaskableText',
};

type Story = StoryObj<typeof MaskableText>;

export const Default: Story = {
  args: {
    children: <Typography>Hide me</Typography>,
    isMaskedPreferenceEnabled: true,
    isToggleable: true,
    text: 'Hide me',
  },
  render: (args) => <MaskableText {...args} />,
};

export default meta;
