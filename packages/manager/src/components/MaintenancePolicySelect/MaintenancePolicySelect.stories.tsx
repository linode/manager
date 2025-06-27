import { MaintenancePolicySelect } from './MaintenancePolicySelect';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof MaintenancePolicySelect> = {
  title: 'Components/Selects/MaintenancePolicySelect',
  component: MaintenancePolicySelect,
};

export default meta;
type Story = StoryObj<typeof MaintenancePolicySelect>;

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const WithError: Story = {
  args: {
    errorText: 'This field is required',
  },
};
