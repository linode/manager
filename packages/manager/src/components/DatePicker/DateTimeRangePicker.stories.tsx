import { action } from '@storybook/addon-actions';
import { DateTime } from 'luxon';
import * as React from 'react';

import { DateTimeRangePicker } from './DateTimeRangePicker';

import type { Meta, StoryObj } from '@storybook/react';

type Story = StoryObj<typeof DateTimeRangePicker>;

export const Default: Story = {
  args: {
    endDateErrorMessage: '',
    endDateTimeValue: null,
    endLabel: 'End Date and Time',
    format: 'yyyy-MM-dd HH:mm',
    onChange: action('DateTime range changed'),
    showEndTimeZone: true,
    showStartTimeZone: true,
    startDateErrorMessage: '',
    startDateTimeValue: null,
    startLabel: 'Start Date and Time',
    startTimeZoneValue: null,
  },
  render: (args) => <DateTimeRangePicker {...args} />,
};

export const WithInitialValues: Story = {
  args: {
    endDateTimeValue: DateTime.now(),
    endLabel: 'End Date and Time',
    format: 'yyyy-MM-dd HH:mm',
    onChange: action('DateTime range changed'),
    showEndTimeZone: true,
    showStartTimeZone: true,
    startDateTimeValue: DateTime.now().minus({ days: 1 }),
    startLabel: 'Start Date and Time',
    startTimeZoneValue: 'America/New_York',
  },
};

export const WithCustomErrors: Story = {
  args: {
    endDateErrorMessage: 'End date must be after the start date.',
    endDateTimeValue: DateTime.now().minus({ days: 1 }),
    endLabel: 'Custom End Label',
    format: 'yyyy-MM-dd HH:mm',
    onChange: action('DateTime range changed'),
    startDateErrorMessage: 'Start date must be before the end date.',
    startDateTimeValue: DateTime.now().minus({ days: 2 }),
    startLabel: 'Custom Start Label',
  },
};

const meta: Meta<typeof DateTimeRangePicker> = {
  argTypes: {
    endDateErrorMessage: {
      control: 'text',
      description: 'Custom error message for invalid end date',
    },
    endDateTimeValue: {
      control: 'date',
      description: 'Initial or controlled value for the end date-time',
    },
    endLabel: {
      control: 'text',
      description: 'Custom label for the end date-time picker',
    },
    format: {
      control: 'text',
      description: 'Format for displaying the date-time',
    },
    onChange: {
      action: 'DateTime range changed',
      description: 'Callback when the date-time range changes',
    },
    showEndTimeZone: {
      control: 'boolean',
      description:
        'Whether to show the timezone selector for the end date picker',
    },
    showStartTimeZone: {
      control: 'boolean',
      description:
        'Whether to show the timezone selector for the start date picker',
    },
    startDateErrorMessage: {
      control: 'text',
      description: 'Custom error message for invalid start date',
    },
    startDateTimeValue: {
      control: 'date',
      description: 'Initial or controlled value for the start date-time',
    },
    startLabel: {
      control: 'text',
      description: 'Custom label for the start date-time picker',
    },
    startTimeZoneValue: {
      control: 'text',
      description: 'Initial or controlled value for the start timezone',
    },
    sx: {
      control: 'object',
      description: 'Styles to apply to the root element',
    },
  },
  args: {
    endLabel: 'End Date and Time',
    format: 'yyyy-MM-dd HH:mm',
    startLabel: 'Start Date and Time',
  },
  component: DateTimeRangePicker,
  title: 'Components/DateTimeRangePicker',
};

export default meta;
