import React from 'react';
import Typography from 'src/components/core/Typography';
import { TextTooltip } from './TextTooltip';
import type { TextTooltipProps } from './TextTooltip';
import type { Meta, StoryObj } from '@storybook/react';

/** Default TextTooltip */
export const Default: StoryObj<TextTooltipProps> = {
  render: (args) => (
    <Typography>
      This paragraph contains a{' '}
      <TextTooltip
        {...args}
        displayText="tooltip text"
        tooltipText="This is the tooltip content"
      />{' '}
      component.
    </Typography>
  ),
};

/** TextTooltip  with customized width and placement */
export const Customized: StoryObj<TextTooltipProps> = {
  render: (args) => (
    <Typography>
      This paragraph contains a{' '}
      <TextTooltip
        {...args}
        displayText="tooltip text"
        tooltipText="This is the tooltip content"
        placement="top"
        minWidth={'auto'}
      />{' '}
      component.
    </Typography>
  ),
};

const meta: Meta<TextTooltipProps> = {
  title: 'Elements/Tooltip/Text Tooltip',
  component: TextTooltip,
};
export default meta;
