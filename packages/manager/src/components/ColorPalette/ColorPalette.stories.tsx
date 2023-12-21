import React from 'react';

import { ColorPalette } from './ColorPalette';

import type { Meta, StoryObj } from '@storybook/react';

export const Default: StoryObj<typeof ColorPalette> = {
  render: () => <ColorPalette />,
};

const meta: Meta<typeof ColorPalette> = {
  component: ColorPalette,
  title: 'Design System/Color Palette',
};

export default meta;
