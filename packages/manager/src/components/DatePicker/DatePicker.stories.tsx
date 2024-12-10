import { action } from '@storybook/addon-actions';
import * as React from 'react';

import { DatePicker } from './DatePicker';

import type { Meta, StoryObj } from '@storybook/react';
import type { DateTime } from 'luxon';

type Story = StoryObj<typeof DatePicker>;

export const ControlledExample: Story = {
  render: () => {
    const ControlledDatePicker = () => {
      const [selectedDate, setSelectedDate] = React.useState<DateTime | null>();

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
          placeholder="yyyy-MM-dd"
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
