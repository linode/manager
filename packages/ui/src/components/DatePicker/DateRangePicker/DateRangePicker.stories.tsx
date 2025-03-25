import { DateRangePicker } from '../DateRangePicker';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof DateRangePicker> = {
  component: DateRangePicker,
  parameters: {
    docs: {
      description: {
        component: `
### Overview
The Date Range Picker allows users to select a start and end date using a custom calendar component built with Luxon.

### Features
- Dual side-by-side calendars for selecting date ranges
- Preset options for quick selection
- Manual date entry support
- Keyboard navigation for improved usability
- Validation to ensure the start date is before the end date
- Styled according to the CDS design system

### Best Practices
- Ensure that both start and end dates are always valid selections.
- Use presets for common date range selections to enhance the user experience.
- Highlight the selected date range clearly to provide visual feedback.
        `,
      },
    },
  },
  title: 'Components/DatePicker/DateRangePickerV2',
};

export default meta;
type Story = StoryObj<typeof DateRangePicker>;

export const Default: Story = {
  args: {
    endDateProps: {
      label: 'End Date',
      placeholder: 'MM/DD/YYYY',
    },
    presetsProps: {
      enablePresets: true,
    },
    startDateProps: {
      label: 'Start Date',
      placeholder: 'MM/DD/YYYY',
    },
  },
};
