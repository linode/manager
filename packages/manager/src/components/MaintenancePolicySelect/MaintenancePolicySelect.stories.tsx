import { MaintenancePolicySelect } from './MaintenancePolicySelect';

import type { MaintenancePolicyId } from '@linode/api-v4';
import type { Meta, StoryObj } from '@storybook/react';

type MaintenancePolicyOption = {
  description: string;
  label: string;
  value: MaintenancePolicyId;
};

const mockPolicies: MaintenancePolicyOption[] = [
  {
    description: 'Description 1',
    label: 'Label 1',
    value: 1,
  },
  {
    description: 'Description 2',
    label: 'Label 2',
    value: 2,
  },
];

const meta: Meta<typeof MaintenancePolicySelect> = {
  title: 'Components/MaintenancePolicySelect',
  component: MaintenancePolicySelect,
};

export default meta;
type Story = StoryObj<typeof MaintenancePolicySelect>;

export const Default: Story = {
  args: {
    defaultPolicyId: 1,
    value: 1,
    onChange: () => {},
    options: mockPolicies,
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
  args: {
    value: 2,
    onChange: () => {},
    options: mockPolicies,
  },
};
