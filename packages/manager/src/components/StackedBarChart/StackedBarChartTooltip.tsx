import { useTheme } from '@mui/material/styles';
import React from 'react';

import type { TooltipContentProps } from 'recharts';

type ThemeColor = {
  dark: string;
  light: string;
};

const TEXT_PRIMARY_DARK = 'hsl(220, 20%, 96%)';
const TEXT_PRIMARY_LIGHT = 'hsl(220, 13%, 20%)';

type StackedBarChartTooltipProps = Pick<
  TooltipContentProps,
  'active' | 'label' | 'payload'
> & {
  tooltipDateTimeColor?: string;
  tooltipTitle: string;
  valueFormatter?: (value: number) => string;
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
  itemLabel: {
    dark: 'hsl(220, 15%, 82%)',
    light: TEXT_PRIMARY_LIGHT,
  },
  itemValue: {
    dark: 'hsl(220, 18%, 94%)',
    light: TEXT_PRIMARY_LIGHT,
  },
  shadow: {
    dark: '1px 1px 15px hsla(220, 20%, 5%, 0.4), 3px 6px 3px hsla(220, 20%, 5%, 0.2)',
    light:
      '1px 1px 15px hsla(220, 60%, 10%, 0.2), 3px 6px 2px hsla(220, 40%, 10%, 0.2)',
  },
  subtitle: {
    dark: 'hsl(220, 12%, 70%)',
    light: 'hsl(220, 10%, 42%)',
  },
  swatchBorder: {
    dark: 'hsl(220, 10%, 18%)',
    light: 'hsl(220, 18%, 88%)',
  },
  title: {
    dark: TEXT_PRIMARY_DARK,
    light: TEXT_PRIMARY_LIGHT,
  },
};

const resolveThemeColor = (mode: 'dark' | 'light', colors: ThemeColor) => {
  return mode === 'light' ? colors.light : colors.dark;
};

const resolveThemeColorWithOverride = (
  mode: 'dark' | 'light',
  colors: ThemeColor,
  override?: string
) => {
  if (override) {
    return override;
  }

  return resolveThemeColor(mode, colors);
};

const defaultValueFormatter = (value: number) => {
  return new Intl.NumberFormat('en-US').format(value);
};

export const StackedBarChartTooltip = ({
  active,
  label,
  payload,
  tooltipDateTimeColor,
  tooltipTitle,
  valueFormatter = defaultValueFormatter,
}: StackedBarChartTooltipProps) => {
  const cmTheme = useTheme();

  const resolvedBackground = resolveThemeColor(
    cmTheme.palette.mode,
    TOOLTIP_THEME_COLORS.background
  );
  const resolvedBorder = resolveThemeColor(
    cmTheme.palette.mode,
    TOOLTIP_THEME_COLORS.border
  );
  const resolvedItemLabel = resolveThemeColor(
    cmTheme.palette.mode,
    TOOLTIP_THEME_COLORS.itemLabel
  );
  const resolvedItemValue = resolveThemeColor(
    cmTheme.palette.mode,
    TOOLTIP_THEME_COLORS.itemValue
  );
  const resolvedShadow = resolveThemeColor(
    cmTheme.palette.mode,
    TOOLTIP_THEME_COLORS.shadow
  );
  const resolvedSubtitle = resolveThemeColorWithOverride(
    cmTheme.palette.mode,
    TOOLTIP_THEME_COLORS.subtitle,
    tooltipDateTimeColor
  );
  const resolvedSwatchBorder = resolveThemeColor(
    cmTheme.palette.mode,
    TOOLTIP_THEME_COLORS.swatchBorder
  );
  const resolvedTitle = resolveThemeColor(
    cmTheme.palette.mode,
    TOOLTIP_THEME_COLORS.title
  );

  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const tooltipPayload = payload[0]?.payload as
    | undefined
    | { tooltipLabel?: string };
  const tooltipLabel = tooltipPayload?.tooltipLabel ?? String(label ?? '');

  return (
    <div
      style={{
        background: resolvedBackground,
        border: `1px solid ${resolvedBorder}`,
        borderRadius: 4,
        boxShadow: resolvedShadow,
        minWidth: 180,
        padding: '10px 12px',
      }}
    >
      <div
        style={{
          color: resolvedTitle,
          font: cmTheme.font.bold,
          marginBottom: 4,
        }}
      >
        {tooltipTitle}
      </div>
      <div
        style={{
          color: resolvedSubtitle,
          fontSize: 12,
          marginBottom: 8,
        }}
      >
        {tooltipLabel}
      </div>

      {payload.map((item) => (
        <div
          key={typeof item.dataKey === 'function' ? item.name : item.dataKey}
          style={{
            alignItems: 'center',
            display: 'flex',
            fontSize: 12,
            justifyContent: 'space-between',
            marginTop: 4,
          }}
        >
          <div
            style={{
              alignItems: 'center',
              color: resolvedItemLabel,
              display: 'flex',
              gap: 8,
              marginRight: 12,
            }}
          >
            <span
              style={{
                background: item.color,
                border: `1px solid ${resolvedSwatchBorder}`,
                borderRadius: 2,
                display: 'inline-block',
                height: 10,
                width: 10,
              }}
            />
            <span>{item.name}</span>
          </div>
          <span
            style={{
              color: resolvedItemValue,
              font: cmTheme.font.bold,
            }}
          >
            {valueFormatter(Number(item.value ?? 0))}
          </span>
        </div>
      ))}
    </div>
  );
};
