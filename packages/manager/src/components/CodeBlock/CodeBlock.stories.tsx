import React from 'react';

import { CodeBlock } from './CodeBlock';

import type { Meta, StoryFn, StoryObj } from '@storybook/react';

const meta: Meta<typeof CodeBlock> = {
  args: {
    command: 'echo "Hello World"',
    commandType: 'Test label',
    language: 'bash',
  },
  component: CodeBlock,
  decorators: [
    (Story: StoryFn) => (
      <div style={{ margin: '1em' }}>
        <Story />
      </div>
    ),
  ],
  title: 'Components/CodeBlock',
};

export default meta;

type Story = StoryObj<typeof CodeBlock>;

export const Default: Story = {
  render: (args) => <CodeBlock {...args} />,
};
