import { action } from '@storybook/addon-actions';
import { DateTime } from 'luxon';
import * as React from 'react';

import { DateTimePicker } from './DateTimePicker';

import type { Meta, StoryObj } from '@storybook/react';

type Story = StoryObj<typeof DateTimePicker>;

export const ControlledExample: Story = {
  render: () => {
    const ControlledDateTimePicker = () => {
      const [
        selectedDateTime,
        setSelectedDateTime,
      ] = React.useState<DateTime | null>(DateTime.now());

      const handleChange = (newDateTime: DateTime | null) => {
        setSelectedDateTime(newDateTime);
        action('Controlled dateTime change')(newDateTime?.toISO());
      };

      return (
        <DateTimePicker
          timeZoneSelectProps={{
            label: 'Timezone',
            onChange: action('Timezone changed'),
          }}
          label="Controlled Date-Time Picker"
          onApply={action('Apply clicked')}
          onCancel={action('Cancel clicked')}
          onChange={handleChange}
          placeholder="yyyy-MM-dd HH:mm"
          timeSelectProps={{ label: 'Select Time' }}
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
  },
};

const meta: Meta<typeof DateTimePicker> = {
  argTypes: {
    errorText: {
      control: { type: 'text' },
    },
    format: {
      control: { type: 'text' },
    },
    label: {
      control: { type: 'text' },
    },
    onApply: { action: 'applyClicked' },
    onCancel: { action: 'cancelClicked' },
    onChange: { action: 'dateTimeChanged' },
    placeholder: {
      control: { type: 'text' },
    },
  },
  args: {
    format: 'yyyy-MM-dd HH:mm',
    label: 'Date-Time Picker',
    placeholder: 'Select a date and time',
  },
  component: DateTimePicker,
  title: 'Components/DateTimePicker',
};

export default meta;
