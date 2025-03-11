import { TimeZoneSelect } from './TimeZoneSelect';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof TimeZoneSelect> = {
  argTypes: {
    disabled: {
      control: 'boolean',
      description: 'Disables the timezone selection if set to true.',
    },
    errorText: {
      control: 'text',
      description:
        'Displays an error message when an invalid value is entered.',
    },
    label: {
      control: 'text',
      description: 'Label for the timezone selection dropdown.',
    },
    noMarginTop: {
      control: 'boolean',
      description: 'Removes the top margin when set to true.',
    },
    value: {
      control: 'text',
      description: 'The currently selected timezone value.',
    },
  },
  component: TimeZoneSelect,
  parameters: {
    docs: {
      description: {
        component: `
### Overview
The **TimeZoneSelect** component provides a dropdown selection for choosing timezones.

### Features
- Displays timezones with GMT offsets
- Auto-sorted by offset values
- Supports error messages for validation
- Allows custom styling and disabling

### Best Practices
- Ensure a valid timezone is always provided.
- Use error messages for invalid selections.
- Keep labels descriptive to improve user experience.
        `,
      },
    },
  },
  title: 'Components/DatePicker/TimeZoneSelectV2',
};

export default meta;

type Story = StoryObj<typeof TimeZoneSelect>;

export const Default: Story = {
  args: {
    label: 'Select Timezone',
    onChange: () => {},
    value: null,
  },
};

export const WithSelectedTimezone: Story = {
  args: {
    label: 'Select Timezone',
    onChange: () => {},
    value: 'America/New_York',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    label: 'Disabled Timezone Select',
    onChange: () => {},
    value: null,
  },
};

export const WithError: Story = {
  args: {
    errorText: 'Invalid timezone selection',
    label: 'Select Timezone',
    onChange: () => {},
    value: null,
  },
};
