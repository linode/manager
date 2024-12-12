import { action } from '@storybook/addon-actions';
import * as React from 'react';

import { DatePicker } from './DatePicker';

import type { Meta, StoryObj } from '@storybook/react';
import type { DateTime } from 'luxon';

type Story = StoryObj<typeof DatePicker>;

export const Default: Story = {
  argTypes: {
    errorText: {
      control: 'text',
      description: 'Error text to display below the input',
    },
    format: {
      control: 'text',
      description: 'Format of the date when rendered in the input field',
    },
    helperText: {
      control: 'text',
      description: 'Helper text to display below the input',
    },
    label: {
      control: 'text',
      description: 'Label to display for the date picker input',
    },
    onChange: {
      action: 'date-changed',
      description: 'Callback function fired when the value changes',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text for the date picker input',
    },
    textFieldProps: {
      control: 'object',
      description:
        'Additional props to pass to the underlying TextField component',
    },
    value: {
      control: 'date',
      description: 'The currently selected date',
    },
  },
  args: {
    errorText: '',
    format: 'yyyy-MM-dd',
    label: 'Select a Date',
    onChange: action('date-changed'),
    placeholder: 'yyyy-MM-dd',
    textFieldProps: { label: 'Select a Date' },
    value: null,
  },
};

export const ControlledExample: Story = {
  args: {
    errorText: '',
    format: 'yyyy-MM-dd',
    helperText: 'This is a controlled DatePicker',
    label: 'Controlled Date Picker',
    placeholder: 'yyyy-MM-dd',
    value: null,
  },
  render: (args) => {
    const ControlledDatePicker = () => {
      const [selectedDate, setSelectedDate] = React.useState<DateTime | null>();

      const handleChange = (newDate: DateTime | null) => {
        setSelectedDate(newDate);
        action('Controlled date change')(newDate?.toISO());
      };

      return (
        <DatePicker {...args} onChange={handleChange} value={selectedDate} />
      );
    };

    return <ControlledDatePicker />;
  },
};

const meta: Meta<typeof DatePicker> = {
  argTypes: {
    errorText: {
      control: 'text',
    },
    format: {
      control: 'text',
    },
    helperText: {
      control: 'text',
    },
    label: {
      control: 'text',
    },
    onChange: {
      action: 'date-changed',
    },
    placeholder: {
      control: 'text',
    },
    textFieldProps: {
      control: 'object',
    },
    value: {
      control: 'date',
    },
  },
  args: {
    errorText: '',
    format: 'yyyy-MM-dd',
    helperText: '',
    label: 'Select a Date',
    placeholder: 'yyyy-MM-dd',
    value: null,
  },
  component: DatePicker,
  title: 'Components/DatePicker/DatePicker',
};

export default meta;
