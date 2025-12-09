import { styled } from '@mui/material/styles';
import { DateTime } from 'luxon';
import * as React from 'react';

import { StyledActionButton } from '../../Button/StyledActionButton';
import { Stack } from '../../Stack';
import { Typography } from '../../Typography/Typography';

import type { PRESET_LABELS } from '../utils';
import type { Theme } from '@mui/material/styles';

interface PresetsProps {
  onPresetSelect: (
    startDate: DateTime | null,
    endDate: DateTime | null,
    presetLabel: null | string,
  ) => void;
  presetLabels: typeof PRESET_LABELS;
  selectedPreset: null | string;
  timeZone?: string;
}

export const Presets = ({
  onPresetSelect,
  presetLabels,
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
      label: presetLabels.LAST_30_MINUTES,
    },
    {
      getRange: () => ({
        endDate: today.setZone(timeZone),
        startDate: today.minus({ hours: 1 }).setZone(timeZone),
      }),
      label: presetLabels.LAST_HOUR,
    },
    {
      getRange: () => ({
        endDate: today.setZone(timeZone),
        startDate: today.minus({ hours: 12 }).setZone(timeZone),
      }),
      label: presetLabels.LAST_12_HOURS,
    },
    {
      getRange: () => ({
        endDate: today.setZone(timeZone),
        startDate: today.minus({ days: 1 }).setZone(timeZone),
      }),
      label: presetLabels.LAST_DAY,
    },
    {
      getRange: () => ({
        endDate: today.setZone(timeZone),
        startDate: today.minus({ days: 6 }).setZone(timeZone),
      }),
      label: presetLabels.LAST_7_DAYS,
    },
    {
      getRange: () => ({
        endDate: today.setZone(timeZone),
        startDate: today.minus({ days: 30 }).setZone(timeZone),
      }),
      label: presetLabels.LAST_30_DAYS,
    },
    {
      getRange: () => ({
        endDate: today.setZone(timeZone),
        startDate: today
          .startOf('month')
          .setZone(timeZone, { keepLocalTime: true }),
      }),
      label: presetLabels.THIS_MONTH,
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
      label: presetLabels.LAST_MONTH,
    },
    {
      getRange: () => ({ endDate: null, startDate: null }),
      label: presetLabels.RESET,
    },
  ];

  return (
    <Stack
      sx={(theme: Theme) => ({
        backgroundColor: theme.tokens.component.Calendar.PresetArea.Background,
        borderRight: `1px solid ${theme.tokens.component.Calendar.Border}`,
        width: '134px',
      })}
    >
      <Typography
        sx={(theme: Theme) => ({
          font: theme.tokens.alias.Typography.Label.Bold.S,
          padding: theme.spacingFunction(16),
        })}
      >
        Presets
      </Typography>
      {presets.map((preset) => {
        const isSelected = selectedPreset === preset.label;
        const { endDate, startDate } = preset.getRange();
        return (
          <StyledPresetButton
            $isSelected={isSelected}
            data-qa-preset={`${preset.label}`}
            key={preset.label}
            onClick={() => {
              onPresetSelect(startDate, endDate, preset.label);
            }}
            variant="text"
          >
            {preset.label}
          </StyledPresetButton>
        );
      })}
    </Stack>
  );
};

const StyledPresetButton = styled(StyledActionButton, {
  shouldForwardProp: (prop) => prop !== '$isSelected',
})<{ $isSelected: boolean }>(({ theme, $isSelected }) => {
  const activePeriod = theme.tokens.component.Calendar.PresetArea.ActivePeriod;
  const hoverPeriod = theme.tokens.component.Calendar.PresetArea.HoverPeriod;
  const defaultBg = theme.tokens.component.Calendar.PresetArea.Background;
  const defaultText = theme.tokens.component.Calendar.DateRange.Text;

  return {
    backgroundColor: $isSelected ? activePeriod.Background : defaultBg,
    color: $isSelected ? activePeriod.Text : defaultText,
    justifyContent: 'flex-start',
    padding: `${theme.spacingFunction(8)} ${theme.spacingFunction(4)} ${theme.spacingFunction(8)} ${theme.spacingFunction(12)}`,
    marginLeft: theme.spacingFunction(4),
    marginRight: theme.spacingFunction(4),
    textTransform: 'initial',
    '&:active, &:focus': {
      backgroundColor: activePeriod.Background,
      color: activePeriod.Text,
    },
    '&:hover': {
      backgroundColor: $isSelected
        ? activePeriod.Background
        : hoverPeriod.Background,
      color: $isSelected ? activePeriod.Text : defaultText,
    },
  };
});
