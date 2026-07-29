import { useTheme } from '@mui/material/styles';
import React from 'react';

import type { TooltipContentProps } from 'recharts';

type ThemeColor = {
  dark: string;
  light: string;
};

type DonutChartTooltipProps = Pick<
  TooltipContentProps,
  'active' | 'payload'
> & {
  total: number;
  valueFormatter: (value: number) => string;
};

const TOOLTIP_THEME_COLORS = {
  background: {
    dark: 'hsl(220, 8%, 16%)',
    light: 'hsl(0, 0%, 100%)',
  },
  border: {
    dark: 'hsl(220, 16%, 30%)',
    light: 'hsl(220, 13%, 84%)',
  },
  label: {
    dark: 'hsl(220, 15%, 82%)',
    light: 'hsl(220, 13%, 20%)',
  },
  shadow: {
    dark: '1px 1px 15px hsla(220, 20%, 5%, 0.4), 3px 6px 3px hsla(220, 20%, 5%, 0.2)',
    light:
      '1px 1px 15px hsla(220, 60%, 10%, 0.2), 3px 6px 2px hsla(220, 40%, 10%, 0.2)',
  },
  value: {
    dark: 'hsl(220, 18%, 94%)',
    light: 'hsl(220, 13%, 20%)',
  },
};

const resolveThemeColor = (mode: 'dark' | 'light', colors: ThemeColor) => {
  return mode === 'light' ? colors.light : colors.dark;
};

export const DonutChartTooltip = ({
  active,
  payload,
  total,
  valueFormatter,
}: DonutChartTooltipProps) => {
  const cmTheme = useTheme();

  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const item = payload[0];
  const sliceValue = Number(item?.value ?? 0);
  const percentage = total > 0 ? (sliceValue / total) * 100 : 0;
  const label =
    (item?.payload as undefined | { label?: string })?.label ??
    String(item?.name ?? '');

  const resolvedBackground = resolveThemeColor(
    cmTheme.palette.mode,
    TOOLTIP_THEME_COLORS.background
  );
  const resolvedBorder = resolveThemeColor(
    cmTheme.palette.mode,
    TOOLTIP_THEME_COLORS.border
  );
  const resolvedLabelColor = resolveThemeColor(
    cmTheme.palette.mode,
    TOOLTIP_THEME_COLORS.label
  );
  const resolvedShadow = resolveThemeColor(
    cmTheme.palette.mode,
    TOOLTIP_THEME_COLORS.shadow
  );
  const resolvedValueColor = resolveThemeColor(
    cmTheme.palette.mode,
    TOOLTIP_THEME_COLORS.value
  );

  return (
    <div
      style={{
        background: resolvedBackground,
        border: `1px solid ${resolvedBorder}`,
        borderRadius: 4,
        boxShadow: resolvedShadow,
        minWidth: 210,
        padding: '10px 12px',
      }}
    >
      <div
        style={{
          alignItems: 'center',
          color: resolvedLabelColor,
          columnGap: 8,
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) auto auto',
        }}
      >
        <span
          style={{
            color: resolvedValueColor,
            display: 'inline-block',
            font: cmTheme.font.normal,
            fontSize: 12,
            marginLeft: 12,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={label}
        >
          {label}
        </span>
        <span
          style={{
            color: resolvedValueColor,
            font: cmTheme.font.bold,
            fontSize: 12,
            whiteSpace: 'nowrap',
          }}
        >
          {percentage.toFixed(1)}%
        </span>
        <span
          style={{
            color: resolvedValueColor,
            font: cmTheme.font.bold,
            fontSize: 12,
            whiteSpace: 'nowrap',
          }}
        >
          {valueFormatter(sliceValue)}
        </span>
      </div>
    </div>
  );
};
