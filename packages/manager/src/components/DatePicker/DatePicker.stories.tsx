import { action } from '@storybook/addon-actions';
import { DateTime } from 'luxon';
import * as React from 'react';

import { DatePicker } from './DatePicker';

import type { Meta, StoryObj } from '@storybook/react';

type Story = StoryObj<typeof DatePicker>;

export const ControlledExample: Story = {
  render: () => {
    const ControlledDatePicker = () => {
      const [selectedDate, setSelectedDate] = React.useState<DateTime | null>(
        DateTime.now()
      );

      const handleChange = (newDate: DateTime | null) => {
        setSelectedDate(newDate);
        action('Controlled date change')(newDate?.toISO());
      };

      return (
        <DatePicker
          format="yyyy-MM-dd"
          helperText="This is a controlled DatePicker"
          label="Controlled Date Picker"
          onChange={handleChange}
          value={selectedDate}
        />
      );
    };

    return <ControlledDatePicker />;
  },
};

const meta: Meta<typeof DatePicker> = {
  component: DatePicker,
  title: 'Components/DatePicker',
};

export default meta;
