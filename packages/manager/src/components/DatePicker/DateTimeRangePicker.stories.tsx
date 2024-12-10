import { action } from '@storybook/addon-actions';
import { DateTime } from 'luxon';
import * as React from 'react';

import { DateTimeRangePicker } from './DateTimeRangePicker';

import type { Meta, StoryObj } from '@storybook/react';

type Story = StoryObj<typeof DateTimeRangePicker>;

export const Default: Story = {
  args: {
    endLabel: 'End Date and Time',
    format: 'yyyy-MM-dd HH:mm',
    onChange: action('DateTime range changed'),
    startLabel: 'Start Date and Time',
  },
  render: (args) => <DateTimeRangePicker {...args} />,
};

export const WithInitialValues: Story = {
  render: () => {
    const ComponentWithState: React.FC = () => {
      const [start, setStart] = React.useState<DateTime | null>(
        DateTime.now().minus({ days: 1 })
      );
      const [end, setEnd] = React.useState<DateTime | null>(DateTime.now());

      const handleDateChange = (
        newStart: DateTime | null,
        newEnd: DateTime | null
      ) => {
        setStart(newStart);
        setEnd(newEnd);
        action('DateTime range changed')(newStart?.toISO(), newEnd?.toISO());
      };

      return (
        <DateTimeRangePicker
          endDateTimeValue={end}
          endLabel="End Date and Time"
          format="yyyy-MM-dd HH:mm"
          onChange={handleDateChange}
          startDateTimeValue={start}
          startLabel="Start Date and Time"
        />
      );
    };

    return <ComponentWithState />;
  },
};

const meta: Meta<typeof DateTimeRangePicker> = {
  argTypes: {
    endLabel: {
      control: 'text',
      description: 'Label for the end date picker',
    },
    format: {
      control: 'text',
      description: 'Format for displaying the date-time',
    },
    onChange: {
      action: 'DateTime range changed',
      description: 'Callback when the date-time range changes',
    },
    startLabel: {
      control: 'text',
      description: 'Label for the start date picker',
    },
  },
  component: DateTimeRangePicker,
  title: 'Components/DateTimeRangePicker',
};

export default meta;
