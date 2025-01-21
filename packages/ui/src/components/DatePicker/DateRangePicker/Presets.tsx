import { DateTime } from 'luxon';
import * as React from 'react';

import { Button } from '../../Button';
import { Stack } from '../../Stack';

interface PresetsProps {
  onPresetSelect: (
    startDate: DateTime | null,
    endDate: DateTime | null
  ) => void;
}

export const Presets = ({ onPresetSelect }: PresetsProps) => {
  const today = DateTime.now();

  const presets = [
    {
      getRange: () => ({
        endDate: today.endOf('week'),
        startDate: today.startOf('week'),
      }),
      label: 'This Week',
    },
    {
      getRange: () => ({
        endDate: today.minus({ weeks: 1 }).endOf('week'),
        startDate: today.minus({ weeks: 1 }).startOf('week'),
      }),
      label: 'Last Week',
    },
    {
      getRange: () => ({
        endDate: today,
        startDate: today.minus({ days: 6 }),
      }),
      label: 'Last 7 Days',
    },
    {
      getRange: () => ({
        endDate: today.endOf('month'),
        startDate: today.startOf('month'),
      }),
      label: 'Current Month',
    },
    {
      getRange: () => ({
        endDate: today.plus({ months: 1 }).endOf('month'),
        startDate: today.plus({ months: 1 }).startOf('month'),
      }),
      label: 'Next Month',
    },
    {
      getRange: () => ({ endDate: null, startDate: null }),
      label: 'Reset',
    },
  ];

  return (
    <Stack spacing={1}>
      {presets.map((preset) => (
        <Button
          onClick={() => {
            const { endDate, startDate } = preset.getRange();
            onPresetSelect(startDate, endDate);
          }}
          sx={{
            borderRadius: '8px',
            padding: '8px 16px',
            width: '140px',
          }}
          key={preset.label}
          variant="outlined"
        >
          {preset.label}
        </Button>
      ))}
    </Stack>
  );
};
