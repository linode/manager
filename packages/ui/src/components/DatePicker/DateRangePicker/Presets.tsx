import { DateTime } from 'luxon';
import * as React from 'react';

import { StyledActionButton } from '../../Button/StyledActionButton';
import { Stack } from '../../Stack';
import { Typography } from '../../Typography/Typography';

import type { Theme } from '@mui/material/styles';

interface PresetsProps {
  onPresetSelect: (
    startDate: DateTime | null,
    endDate: DateTime | null,
    presetLabel: null | string,
  ) => void;
  selectedPreset: null | string;
  timeZone?: string;
}

export const Presets = ({
  onPresetSelect,
  selectedPreset,
  timeZone = 'UTC',
}: PresetsProps) => {
  const today = DateTime.now();

  const presets = [
    {
      getRange: () => ({
        endDate: today.setZone(timeZone),
        startDate: today.minus({ minutes: 30 }).setZone(timeZone),
      }),
      label: 'last 30 minutes',
    },
    {
      getRange: () => ({
        endDate: today.setZone(timeZone),
        startDate: today.minus({ hours: 1 }).setZone(timeZone),
      }),
      label: 'last hour',
    },
    {
      getRange: () => ({
        endDate: today.setZone(timeZone),
        startDate: today.minus({ hours: 12 }).setZone(timeZone),
      }),
      label: 'last 12 hours',
    },
    {
      getRange: () => ({
        endDate: today.setZone(timeZone),
        startDate: today.minus({ days: 1 }).setZone(timeZone),
      }),
      label: 'last day',
    },
    {
      getRange: () => ({
        endDate: today.setZone(timeZone),
        startDate: today.minus({ days: 6 }).setZone(timeZone),
      }),
      label: 'last 7 days',
    },
    {
      getRange: () => ({
        endDate: today.setZone(timeZone),
        startDate: today.minus({ days: 30 }).setZone(timeZone),
      }),
      label: 'last 30 days',
    },
    {
      getRange: () => ({
        endDate: today.setZone(timeZone),
        startDate: today
          .startOf('month')
          .setZone(timeZone, { keepLocalTime: true }),
      }),
      label: 'this month',
    },
    {
      getRange: () => {
        const lastMonth = today
          .minus({ months: 1 })
          .setZone(timeZone, { keepLocalTime: true });
        return {
          startDate: lastMonth.startOf('month'),
          endDate: lastMonth.endOf('month'),
        };
      },
      label: 'last month',
    },
    {
      getRange: () => ({ endDate: null, startDate: null }),
      label: 'reset',
    },
  ];

  return (
    <Stack
      paddingLeft={1}
      paddingRight={1 / 4}
      paddingTop={3}
      sx={(theme: Theme) => ({
        backgroundColor: theme.tokens.component.Calendar.PresetArea.Background,
        borderRight: `1px solid ${theme.tokens.component.Calendar.Border}`,
        width: '134px',
      })}
    >
      <Typography
        sx={(theme: Theme) => ({
          marginBottom: theme.spacing(1),
          paddingLeft: theme.spacing(1),
        })}
      >
        Presets
      </Typography>
      {presets.map((preset) => {
        const isSelected = selectedPreset === preset.label;
        const { endDate, startDate } = preset.getRange();
        return (
          <StyledActionButton
            data-qa-preset={`${preset.label}`}
            key={preset.label}
            onClick={() => {
              onPresetSelect(startDate, endDate, preset.label);
            }}
            sx={(theme: Theme) => ({
              '&:active, &:focus': {
                backgroundColor:
                  theme.tokens.component.Calendar.PresetArea.ActivePeriod
                    .Background,
                color:
                  theme.tokens.component.Calendar.PresetArea.ActivePeriod.Text,
              },
              '&:hover': {
                backgroundColor: !isSelected
                  ? theme.tokens.component.Calendar.PresetArea.HoverPeriod
                      .Background
                  : '',
                color: isSelected
                  ? theme.tokens.component.Calendar.PresetArea.ActivePeriod.Text
                  : theme.tokens.component.Calendar.DateRange.Text,
              },
              backgroundColor: isSelected
                ? theme.tokens.component.Calendar.PresetArea.ActivePeriod
                    .Background
                : theme.tokens.component.Calendar.PresetArea.Background,
              color: isSelected
                ? theme.tokens.component.Calendar.PresetArea.ActivePeriod.Text
                : theme.tokens.component.Calendar.DateRange.Text,
              justifyContent: 'flex-start',
              padding: theme.spacing(),
            })}
            variant="text"
          >
            {preset.label}
          </StyledActionButton>
        );
      })}
    </Stack>
  );
};
