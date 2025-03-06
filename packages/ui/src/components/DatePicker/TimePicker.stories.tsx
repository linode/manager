import { DateTime } from 'luxon';

import { TimePicker } from './TimePicker';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof TimePicker> = {
  argTypes: {
    errorText: {
      control: 'text',
      description: 'Displays an error message when an invalid time is entered.',
    },
    format: {
      control: 'select',
      description: 'Format in which time should be displayed.',
      options: ['HH:mm', 'hh:mm a'], // 24-hour & 12-hour formats
    },
    label: {
      control: 'text',
      description: 'Label for the input field.',
    },
    sx: {
      control: 'object',
      description: 'MUI sx prop for custom styling.',
    },
  },
  component: TimePicker,
  parameters: {
    docs: {
      description: {
        component: `
### Overview
The **TimePicker** component provides an easy way to input time values using MUI's TimePicker.

### Features
- Supports 12-hour and 24-hour time formats
- Displays error messages for validation
- Accepts manual input or selection via UI
- Fully accessible with screen readers

### Best Practices
- Ensure a valid format is always provided.
- Use error messages for invalid time inputs.
- Keep labels descriptive to improve user experience.
      `,
      },
    },
  },
  title: 'Components/DatePicker/TimePickerV2',
};

export default meta;

type Story = StoryObj<typeof TimePicker>;

export const Default: Story = {
  args: {
    errorText: '',
    format: 'hh:mm a',
    label: 'Select Time',
    value: null,
    onChange: () => {},
  },
};

export const Interactive: Story = {
  args: {
    format: 'HH:mm',
    label: 'Pick a Time',
    value: DateTime.now(),
    onChange: () => {},
  },
};

export const WithError: Story = {
  args: {
    errorText: 'Invalid time format',
    format: 'hh:mm a',
    label: 'Invalid Time Input',
    value: null,
    onChange: () => {},
  },
};
