import { Box } from '@linode/ui';
import React, { useState } from 'react';

import { maintenancePolicyOptions } from './constants';
import { MaintenancePolicySelect } from './MaintenancePolicySelect';

import type { MaintenancePolicyId } from '@linode/api-v4';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof MaintenancePolicySelect> = {
  title: 'Components/Selects/MaintenancePolicySelect',
  component: MaintenancePolicySelect,
  decorators: [
    (Story) => (
      <Box p={2}>
        <Story />
      </Box>
    ),
    (Story, context) => {
      const [value, setValue] = useState<MaintenancePolicyId>(1);
      return (
        <Story
          args={{
            ...context.args,
            value,
            onChange: (_, option) => setValue(option.value),
            options: maintenancePolicyOptions,
          }}
        />
      );
    },
  ],
};

export default meta;
type Story = StoryObj<typeof MaintenancePolicySelect>;

export const Default: Story = {
  args: {
    defaultPolicyId: 1,
  },
};

export const Disabled: Story = {
  args: {
    ...Default.args,
    disabled: true,
  },
};

export const WithError: Story = {
  args: {
    ...Default.args,
    errorText: 'This field is required',
  },
};

export const WithoutDefault: Story = {
  decorators: [
    (Story, context) => {
      const [value, setValue] = useState<MaintenancePolicyId>(2);
      return (
        <Story
          args={{
            ...context.args,
            value,
            onChange: (_, option) => setValue(option.value),
            options: maintenancePolicyOptions,
          }}
        />
      );
    },
  ],
};
