import { action } from '@storybook/addon-actions';
import { DateTime } from 'luxon';
import * as React from 'react';

import { DateTimeRangePicker } from './DateTimeRangePicker';

import type { Meta, StoryObj } from '@storybook/react';

type Story = StoryObj<typeof DateTimeRangePicker>;

export const Default: Story = {
  args: {
    enablePresets: true,
    endDateProps: {
      label: 'End Date and Time',
      placeholder: '',
      showTimeZone: false,
      value: null,
    },

    format: 'yyyy-MM-dd HH:mm',
    onChange: action('DateTime range changed'),
    presetsProps: {
      defaultValue: '',
      label: '',
      placeholder: '',
    },
    startDateProps: {
      errorMessage: '',
      label: 'Start Date and Time',
      placeholder: '',
      showTimeZone: true,
      timeZoneValue: null,
      value: null,
    },
    sx: {},
  },
  render: (args) => <DateTimeRangePicker {...args} />,
};

export const WithInitialValues: Story = {
  args: {
    enablePresets: true,
    endDateProps: {
      label: 'End Date and Time',
      showTimeZone: true,
      value: DateTime.now(),
    },

    format: 'yyyy-MM-dd HH:mm',
    onChange: action('DateTime range changed'),
    presetsProps: {
      defaultValue: '7days',
      label: 'Time Range',
      placeholder: 'Select Range',
    },
    startDateProps: {
      label: 'Start Date and Time',
      showTimeZone: true,
      timeZoneValue: 'America/New_York',
      value: DateTime.now().minus({ days: 1 }),
    },
    sx: {},
  },
};

export const WithCustomErrors: Story = {
  args: {
    enablePresets: true,
    endDateProps: {
      label: 'Custom End Label',
      placeholder: '',
      showTimeZone: false,
      value: DateTime.now().minus({ days: 1 }),
    },
    format: 'yyyy-MM-dd HH:mm',
    onChange: action('DateTime range changed'),
    presetsProps: {
      defaultValue: '',

      label: '',
      placeholder: '',
    },
    startDateProps: {
      errorMessage: 'Start date must be before the end date.',
      label: 'Start Date and Time',
      placeholder: '',
      showTimeZone: true,
      timeZoneValue: null,
      value: DateTime.now().minus({ days: 2 }),
    },
  },
};

const meta: Meta<typeof DateTimeRangePicker> = {
  argTypes: {
    endDateProps: {
      errorMessage: {
        control: 'text',
        description: 'Custom error message for invalid end date',
      },
      label: {
        control: 'text',
        description: 'Custom label for the end date-time picker',
      },
      placeholder: {
        control: 'text',
        description: 'Placeholder for the end date-time',
      },
      showTimeZone: {
        control: 'boolean',
        description:
          'Whether to show the timezone selector for the end date picker',
      },
      value: {
        control: 'date',
        description: 'Initial or controlled value for the end date-time',
      },
    },
    format: {
      control: 'text',
      description: 'Format for displaying the date-time',
    },
    onChange: {
      action: 'DateTime range changed',
      description: 'Callback when the date-time range changes',
    },
    presetsProps: {
      defaultValue: {
        label: {
          control: 'text',
          description: 'Default value label for the presets field',
        },
        value: {
          control: 'text',
          description: 'Default value for the presets field',
        },
      },
      enablePresets: {
        control: 'boolean',
        description:
          'If true, shows the date presets field instead of the date pickers',
      },
      label: {
        control: 'text',
        description: 'Label for the presets dropdown',
      },
      placeholder: {
        control: 'text',
        description: 'Placeholder for the presets dropdown',
      },
    },
    startDateProps: {
      errorMessage: {
        control: 'text',
        description: 'Custom error message for invalid start date',
      },
      placeholder: {
        control: 'text',
        description: 'Placeholder for the start date-time',
      },
      showTimeZone: {
        control: 'boolean',
        description:
          'Whether to show the timezone selector for the start date picker',
      },
      startLabel: {
        control: 'text',
        description: 'Custom label for the start date-time picker',
      },
      timeZoneValue: {
        control: 'text',
        description: 'Initial or controlled value for the start timezone',
      },
      value: {
        control: 'date',
        description: 'Initial or controlled value for the start date-time',
      },
    },
    sx: {
      control: 'object',
      description: 'Styles to apply to the root element',
    },
  },
  args: {
    endDateProps: { label: 'End Date and Time' },
    format: 'yyyy-MM-dd HH:mm',
    startDateProps: { label: 'Start Date and Time' },
  },
  component: DateTimeRangePicker,
  title: 'Components/DatePicker/DateTimeRangePicker',
};

export default meta;
