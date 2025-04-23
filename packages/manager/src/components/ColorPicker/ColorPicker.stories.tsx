import React from 'react';

import { ColorPicker } from 'src/components/ColorPicker/ColorPicker';

import type { ColorPickerProps } from './ColorPicker';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<ColorPickerProps> = {
  args: {
    defaultColor: '#0174bc',
    label: 'Label for color picker',
    onChange: () => undefined,
  },
  component: ColorPicker,
  title: 'Components/ColorPicker',
};

export const Default: StoryObj<ColorPickerProps> = {
  render: (args) => {
    return <ColorPicker {...args} />;
  },
};

export default meta;
