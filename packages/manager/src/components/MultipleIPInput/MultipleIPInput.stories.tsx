import React, { useState } from 'react';

import { MultipleIPInput } from './MultipleIPInput';

import type { Meta, StoryFn, StoryObj } from '@storybook/react';

type Story = StoryObj<typeof MultipleIPInput>;

const mockTitle = 'IP Address';

const defaultArgs = {
  buttonText: 'Add An IP',
  ips: [{ address: '192.0.2.1/01' }, { address: '192.0.2.1/02' }],
  title: mockTitle,
};

const meta: Meta<typeof MultipleIPInput> = {
  component: MultipleIPInput,
  decorators: [
    (Story: StoryFn) => (
      <div style={{ margin: '2em' }}>
        <Story />
      </div>
    ),
  ],
  title: 'Components/MultipleIPInput',
};

export default meta;

export const Default: Story = {
  args: defaultArgs,
  render: (args) => {
    const MultipleIPInputWithState = () => {
      const [ips, setIps] = useState(defaultArgs.ips);

      const handleChange = (newIps: typeof ips) => {
        setIps(newIps);
      };

      return (
        <MultipleIPInput
          {...args}
          ips={ips}
          onChange={handleChange}
          placeholder={mockTitle}
        />
      );
    };

    return <MultipleIPInputWithState />;
  },
};

export const Disabled: Story = {
  args: {
    ...defaultArgs,
    disabled: true,
  },
};

export const HelperText: Story = {
  args: {
    ...defaultArgs,
    helperText: 'helperText',
  },
};

export const Placeholder: Story = {
  args: {
    ips: [{ address: '' }],
    placeholder: 'placeholder',
    title: mockTitle,
  },
};
