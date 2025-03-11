import { DateTime } from 'luxon';

import { DateTimeField } from './DateTimeField';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof DateTimeField> = {
  argTypes: {
    errorText: {
      control: 'text',
      description:
        'Displays an error message when an invalid value is entered.',
    },
    format: {
      control: 'select',
      description: 'Format in which date and time should be displayed.',
      options: [
        'MM/dd/yyyy HH:mm',
        'MM/dd/yyyy hh:mm a',
        'dd-MM-yyyy HH:mm',
        'dd-MM-yyyy hh:mm a',
        'yyyy-MM-dd HH:mm',
        'yyyy-MM-dd hh:mm a',
      ],
    },
    label: {
      control: 'text',
      description: 'Label for the input field.',
    },
  },
  component: DateTimeField,
  parameters: {
    docs: {
      description: {
        component: `
### Overview
The **DateTimeField** component provides a user-friendly way to input date and time values.

### Features
- Supports various date-time formats
- Displays error messages for validation
- Accepts manual input or selection via UI
- Fully accessible with screen readers

### Best Practices
- Ensure a valid format is always provided.
- Use error messages for invalid date/time values.
- Keep labels descriptive to help users understand the input.
        `,
      },
    },
  },
  title: 'Components/DatePicker/DateTimeFieldV2',
};

export default meta;

type Story = StoryObj<typeof DateTimeField>;

export const Default: Story = {
  args: {
    errorText: '',
    format: 'yyyy-MM-dd HH:mm',
    label: 'Select Date & Time',
    value: null,
    onChange: () => {},
  },
};

export const Interactive: Story = {
  args: {
    format: 'yyyy-MM-dd hh:mm a',
    label: 'Pick a Date & Time',
    value: DateTime.now(),
    onChange: () => {},
  },
};

export const WithError: Story = {
  args: {
    errorText: 'Invalid date format',
    format: 'MM/dd/yyyy HH:mm',
    label: 'Invalid Date Input',
    value: null,
    onChange: () => {},
  },
};
