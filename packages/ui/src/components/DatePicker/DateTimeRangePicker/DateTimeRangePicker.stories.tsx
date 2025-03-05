import React from 'react';

import { DateTimeRangePicker } from './DateTimeRangePicker';

import type { DateTimeRangePickerProps } from './DateTimeRangePicker';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof DateTimeRangePicker> = {
  argTypes: {
    endDateProps: {
      control: 'object',
      description: 'Props for end date input field.',
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
    onApply: {
      action: 'onApply',
      description: 'Called when the user clicks Apply.',
    },
    presetsProps: {
      control: 'object',
      description: 'Controls if presets are enabled and sets default values.',
    },
    startDateProps: {
      control: 'object',
      description: 'Props for start date input field.',
    },
  },
  component: DateTimeRangePicker,
  parameters: {
    docs: {
      description: {
        component: `
### Overview
The **DateTimeRangePicker** component allows users to select a start and end date-time range, along with timezone support.

### Features
- Select **start & end dates** using a custom calendar
- Pick **time values** using a time picker
- Adjust **timezones** dynamically
- Use **presets** for common date ranges
- Ensures **validation** between start and end dates

### Best Practices
- Ensure the start date is before the end date.
- Use presets for common ranges to improve usability.
- Highlight the selected range for better visibility.
        `,
      },
    },
  },
  title: 'Components/DatePicker/DateTimeRangePickerV2',
};

export default meta;

type Story = StoryObj<typeof DateTimeRangePicker>;

export const Default: Story = {
  render: (args: DateTimeRangePickerProps) => {
    return (
      <DateTimeRangePicker
        {...args}
        endDateProps={{
          label: 'End Date',
          showTimeZone: true,
        }}
        presetsProps={{
          defaultValue: 'Last 7 days',
          enablePresets: true,
        }}
        startDateProps={{
          label: 'Start Date',
          showTimeZone: true,
        }}
        onApply={() => {}}
      />
    );
  },
};

export const WithPresets: Story = {
  args: {
    presetsProps: {
      defaultValue: 'Last 30 days',
      enablePresets: true,
    },
  },
};

export const WithError: Story = {
  args: {
    endDateProps: {
      errorMessage: 'End date is required',
      label: 'End Date',
    },
    startDateProps: {
      errorMessage: 'Start date is required',
      label: 'Start Date',
    },
  },
};

export const WithCustomTimeZone: Story = {
  render: (args: DateTimeRangePickerProps) => {
    return (
      <DateTimeRangePicker
        {...args}
        endDateProps={{
          label: 'End Date',
          showTimeZone: true,
        }}
        startDateProps={{
          label: 'Start Date',
          showTimeZone: true,
          timeZoneValue: 'UTC',
        }}
        onApply={() => {}}
      />
    );
  },
};
