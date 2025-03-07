import { DateTime } from 'luxon';

import { DateField } from './DateField';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof DateField> = {
  argTypes: {
    errorText: {
      control: 'text',
      description:
        'Displays an error message when an invalid value is entered.',
    },
    format: {
      control: 'select',
      description: 'Format in which date should be displayed.',
      options: ['MM/dd/yyyy', 'dd-MM-yyyy', 'yyyy-MM-dd'],
    },
    label: {
      control: 'text',
      description: 'Label for the input field.',
    },
  },
  component: DateField,
  parameters: {
    docs: {
      description: {
        component: `
### Overview
The **DateField** component provides a user-friendly way to input date values.

### Features
- Supports various date formats
- Displays error messages for validation
- Accepts manual input or selection via UI
- Fully accessible with screen readers

### Best Practices
- Ensure a valid format is always provided.
- Use error messages for invalid date values.
- Keep labels descriptive to help users understand the input.
        `,
      },
    },
  },
  title: 'Components/DatePicker/DateFieldV2',
};

export default meta;

type Story = StoryObj<typeof DateField>;

export const Default: Story = {
  args: {
    errorText: '',
    format: 'yyyy-MM-dd',
    label: 'Select Date',
    value: null,
    onChange: () => {},
  },
};

export const Interactive: Story = {
  args: {
    format: 'dd-MM-yyyy',
    label: 'Pick a Date',
    value: DateTime.now(),
    onChange: () => {},
  },
};

export const WithError: Story = {
  args: {
    errorText: 'Invalid date format',
    format: 'MM/dd/yyyy',
    label: 'Invalid Date Input',
    value: null,
    onChange: () => {},
  },
};
