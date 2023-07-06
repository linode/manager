import * as React from 'react';
import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import type { Meta, StoryObj } from '@storybook/react';
import type { CopyTooltipProps } from './CopyTooltip';

export const Default: StoryObj<CopyTooltipProps> = {
  render: (args) => <CopyTooltip {...args} />,
};

export const WithCopyableText: StoryObj<CopyTooltipProps> = {
  render: (args) => <CopyTooltip {...args} copyableText text="Copyable Text" />,
};

const meta: Meta<CopyTooltipProps> = {
  title: 'Components/Tooltip/Copy Tooltip',
  component: CopyTooltip,
  args: {
    text: 'Copyable Text',
    copyableText: false,
    onClickCallback: undefined,
  },
  argTypes: {
    onClickCallback: { action: 'clicked, text copied' },
  },
};
export default meta;
