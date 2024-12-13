import { action } from '@storybook/addon-actions';
import * as React from 'react';

import { DateTimePicker } from './DateTimePicker';

import type { Meta, StoryObj } from '@storybook/react';
import type { DateTime } from 'luxon';

type Story = StoryObj<typeof DateTimePicker>;

export const ControlledExample: Story = {
  args: {
    label: 'Controlled Date-Time Picker',
    onApply: action('Apply clicked'),
    onCancel: action('Cancel clicked'),
    placeholder: 'yyyy-MM-dd HH:mm',
    showTime: true,
    showTimeZone: true,
    timeSelectProps: {
      label: 'Select Time',
    },
    timeZoneSelectProps: {
      label: 'Timezone',
      onChange: action('Timezone changed'),
    },
  },
  render: (args) => {
    const ControlledDateTimePicker = () => {
      const [
        selectedDateTime,
        setSelectedDateTime,
      ] = React.useState<DateTime | null>(args.value || null);

      const handleChange = (newDateTime: DateTime | null) => {
        setSelectedDateTime(newDateTime);
        action('Controlled dateTime change')(newDateTime?.toISO());
      };

      return (
        <DateTimePicker
          {...args}
          onChange={handleChange}
          value={selectedDateTime}
        />
      );
    };

    return <ControlledDateTimePicker />;
  },
};

export const DefaultExample: Story = {
  args: {
    label: 'Default Date-Time Picker',
    onApply: action('Apply clicked'),
    onCancel: action('Cancel clicked'),
    onChange: action('Date-Time selected'),
    placeholder: 'yyyy-MM-dd HH:mm',
    showTime: true,
    showTimeZone: true,
  },
};

export const WithErrorText: Story = {
  args: {
    errorText: 'This field is required',
    label: 'Date-Time Picker with Error',
    onApply: action('Apply clicked with error'),
    onCancel: action('Cancel clicked with error'),
    onChange: action('Date-Time selected with error'),
    placeholder: 'yyyy-MM-dd HH:mm',
    showTime: true,
    showTimeZone: true,
  },
};

const meta: Meta<typeof DateTimePicker> = {
  argTypes: {
    dateCalendarProps: {
      control: { type: 'object' },
      description: 'Additional props for the DateCalendar component.',
    },
    errorText: {
      control: { type: 'text' },
      description: 'Error text for the date picker field.',
    },
    format: {
      control: { type: 'text' },
      description: 'Format for displaying the date-time.',
    },
    label: {
      control: { type: 'text' },
      description: 'Label for the input field.',
    },
    onApply: {
      action: 'applyClicked',
      description: 'Callback when the "Apply" button is clicked.',
    },
    onCancel: {
      action: 'cancelClicked',
      description: 'Callback when the "Cancel" button is clicked.',
    },
    onChange: {
      action: 'dateTimeChanged',
      description: 'Callback when the date-time changes.',
    },
    placeholder: {
      control: { type: 'text' },
      description: 'Placeholder text for the input field.',
    },
    showTime: {
      control: { type: 'boolean' },
      description: 'Whether to show the time selector.',
    },
    showTimeZone: {
      control: { type: 'boolean' },
      description: 'Whether to show the timezone selector.',
    },
    sx: {
      control: { type: 'object' },
      description: 'Styles to apply to the root element.',
    },
    timeSelectProps: {
      control: { type: 'object' },
      description: 'Props for customizing the TimePicker component.',
    },
    timeZoneSelectProps: {
      control: { type: 'object' },
      description: 'Props for customizing the TimeZoneSelect component.',
    },
    value: {
      control: { type: 'date' },
      description: 'Initial or controlled dateTime value.',
    },
  },
  args: {
    format: 'yyyy-MM-dd HH:mm',
    label: 'Date-Time Picker',
    placeholder: 'Select a date and time',
  },
  component: DateTimePicker,
  title: 'Components/DatePicker/DateTimePicker',
};

export default meta;
