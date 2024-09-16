import { expect, userEvent, within } from '@storybook/test';
import React from 'react';

import { CopyableTextField } from './CopyableTextField';

import type { Meta, StoryFn, StoryObj } from '@storybook/react';

const meta: Meta<typeof CopyableTextField> = {
  args: {
    label: 'Label',
    value: 'Text to copy',
  },
  component: CopyableTextField,
  decorators: [
    (Story: StoryFn) => (
      <div style={{ margin: '1em' }}>
        <Story />
      </div>
    ),
  ],
  title: 'Components/Input/CopyableTextField',
};

export default meta;

type Story = StoryObj<typeof CopyableTextField>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const copyButton = canvas.getByRole('button');

    await userEvent.click(copyButton);
  },
  render: (args) => <CopyableTextField {...args} />,
};

export const WithDownload: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const downloadButton = canvas.getAllByRole('button')[0];

    await userEvent.click(downloadButton);
  },
  render: (args) => <CopyableTextField {...args} showDownloadIcon />,
};

export const WithCopyAndDownload: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const [downloadButton, copyButton] = canvas.getAllByRole('button');

    await userEvent.click(downloadButton);
    await userEvent.click(copyButton);
  },
  render: (args) => <CopyableTextField {...args} showDownloadIcon />,
};

export const WithNoIcons: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const buttons = canvas.queryByRole('button');

    expect(buttons).not.toBeInTheDocument();
  },
  render: (args) => <CopyableTextField {...args} hideIcons />,
};
