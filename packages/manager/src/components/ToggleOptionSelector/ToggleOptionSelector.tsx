import { Box, Typography } from '@linode/ui';
import React from 'react';

export interface ToggleOption {
  disabled?: boolean;
  label: string;
  value: string;
}

export interface ToggleOptionSelectorProps {
  /**
   * Callback fired when a new option is selected.
   */
  onSelect: (value: string) => void;
  /**
   * Array of options to display as toggles.
   */
  options: ToggleOption[];
  /**
   * The currently selected option value.
   */
  selectedValue: string;
  /**
   * Custom border widths for each tab's right border.
   * Useful for customizing the appearance of the toggle group.
   */
  tabRightBorderWidthByIndex?: Partial<Record<number, number>>;
}

const getTabBorderRadius = (index: number, maxIndex: number) => {
  if (index === 0 && maxIndex === 0) {
    return '4px';
  }
  if (index === 0) {
    return '4px 0 0 4px';
  }
  if (index === maxIndex) {
    return '0 4px 4px 0';
  }
  return 0;
};

interface ToggleTabProps {
  disabled?: boolean;
  index: number;
  isActive: boolean;
  label: string;
  maxIndex: number;
  onSelect: () => void;
  tabRightBorderWidthByIndex?: Partial<Record<number, number>>;
}

const ToggleTab = ({
  disabled,
  index,
  isActive,
  label,
  maxIndex,
  onSelect,
  tabRightBorderWidthByIndex: _tabRightBorderWidthByIndex,
}: ToggleTabProps) => (
  <Box
    onClick={disabled ? undefined : onSelect}
    sx={(theme) => ({
      backgroundColor: isActive
        ? theme.palette.primary.main
        : theme.palette.background.paper,
      border: `2px solid ${
        disabled ? theme.palette.action.disabled : theme.palette.primary.main
      }`,
      borderRadius: getTabBorderRadius(index, maxIndex),
      color: disabled
        ? theme.palette.text.disabled
        : isActive
          ? theme.palette.primary.contrastText
          : theme.palette.text.primary,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.6 : 1,
      px: 2,
      py: 0.5,
      textTransform: 'capitalize',
    })}
  >
    <Typography variant="body2">{label}</Typography>
  </Box>
);

export const ToggleOptionSelector = ({
  options,
  selectedValue,
  onSelect,
  tabRightBorderWidthByIndex,
}: ToggleOptionSelectorProps) => {
  return (
    <Box sx={{ display: 'flex', gap: 0 }}>
      {options.map((option, index) => (
        <ToggleTab
          disabled={option.disabled}
          index={index}
          isActive={option.value === selectedValue}
          key={option.value}
          label={option.label}
          maxIndex={options.length - 1}
          onSelect={() => onSelect(option.value)}
          tabRightBorderWidthByIndex={tabRightBorderWidthByIndex}
        />
      ))}
    </Box>
  );
};
