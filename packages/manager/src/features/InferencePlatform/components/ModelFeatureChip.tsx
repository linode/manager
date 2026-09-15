import { Tooltip } from '@akamai/cds-components/react/Tooltip';
import { Chip } from '@linode/ui';
import React from 'react';

export type ModelFeatureChipType =
  | 'inputModes'
  | 'language'
  | 'maxContext'
  | 'outputModes'
  | 'parameters'
  | 'provider'
  | 'search'
  | 'serverless'
  | 'useCaseTags';

interface ModelFeatureChipProps {
  /** Marks the chip as the active/selected option in toggle mode. */
  active?: boolean;
  description?: string;
  label: string;
  onClick?: () => void;
  onDelete?: () => void;
  type: ModelFeatureChipType;
}

const getChipStyles = (type: string, theme: 'dark' | 'light'): object => {
  switch (type) {
    case 'inputModes':
      return {
        color: theme === 'light' ? 'hsl(90, 50%, 35%)' : 'hsl(90, 100%, 90%)',
        backgroundColor:
          theme === 'light' ? 'hsl(90, 50%, 93%)' : 'hsl(90, 15%, 30%)',
      };
    case 'language':
      return {
        color: theme === 'light' ? 'hsl(330, 75%, 35%)' : 'hsl(330, 100%, 90%)',
        backgroundColor:
          theme === 'light' ? 'hsl(330, 50%, 93%)' : 'hsl(330, 15%, 32%)',
      };
    case 'maxContext':
      return {
        color: theme === 'light' ? 'hsl(190, 75%, 35%)' : 'hsl(190, 100%, 90%)',
        backgroundColor:
          theme === 'light' ? 'hsl(190, 50%, 93%)' : 'hsl(190, 15%, 30%)',
      };
    case 'outputModes':
      return {
        color: theme === 'light' ? 'hsl(165, 50%, 35%)' : 'hsl(165, 100%, 90%)',
        backgroundColor:
          theme === 'light' ? 'hsl(165, 60%, 93%)' : 'hsl(165, 15%, 30%)',
      };
    case 'parameters':
      return {
        color: theme === 'light' ? 'hsl(220, 70%, 38%)' : 'hsl(220, 100%, 92%)',
        backgroundColor:
          theme === 'light' ? 'hsl(220, 70%, 93%)' : 'hsl(220, 20%, 35%)',
      };
    case 'provider':
      return {
        color: theme === 'light' ? 'hsl(30, 80%, 35%)' : 'hsl(40, 100%, 85%)',
        backgroundColor:
          theme === 'light' ? 'hsl(60, 75%, 91%)' : 'hsl(60, 15%, 28%)',
      };
    case 'search':
      return {
        color: theme === 'light' ? 'hsl(140, 50%, 35%)' : 'hsl(140, 100%, 89%)',
        backgroundColor:
          theme === 'light' ? 'hsl(140, 50%, 94%)' : 'hsl(140, 15%, 32%)',
      };
    case 'serverless':
      return {
        color: theme === 'light' ? 'hsl(267, 75%, 50%)' : 'hsl(267, 100%, 90%)',
        backgroundColor:
          theme === 'light' ? 'hsl(267, 100%, 96%)' : 'hsl(267, 15%, 34%)',
      };
    case 'useCaseTags':
      return {
        color: theme === 'light' ? 'hsl(280, 75%, 50%)' : 'hsl(280, 100%, 90%)',
        backgroundColor:
          theme === 'light' ? 'hsl(280, 100%, 96%)' : 'hsl(280, 15%, 34%)',
      };
    default:
      return {
        color: theme === 'light' ? 'hsl(267, 0%, 50%)' : 'hsl(267, 0%, 90%)',
        backgroundColor:
          theme === 'light' ? 'hsl(267, 0%, 96%)' : 'hsl(267, 0%, 34%)',
      };
  }
};

export const ModelFeatureChip = ({
  active,
  description,
  label,
  onClick,
  onDelete,
  type,
}: ModelFeatureChipProps) => {
  const chip = (
    <Chip
      label={label}
      onClick={onClick}
      onDelete={onDelete}
      size="small"
      sx={(theme) => {
        const chipStyles = getChipStyles(type, theme.palette.mode) as {
          backgroundColor?: string;
          color?: string;
        };
        return {
          ...chipStyles,
          ...(onClick && !active
            ? { backgroundColor: 'transparent', color: chipStyles.color }
            : {}),
          font: theme.font.semibold,
          fontSize: 12,
          px: 0.7,
          paddingTop: 0.05,
          paddingBottom: 0,
          height: 22,
          '& .MuiChip-deleteIcon': {
            width: 12,
            height: 12,
            padding: 0,
            marginBottom: -0.1,
            py: 0,
            color: chipStyles.color,
            opacity: 0.3,
            '&:hover': { opacity: 1 },
            '&:active': { opacity: 0.1 },
          },
        };
      }}
      variant="filled"
    />
  );

  if (description) {
    return <Tooltip tooltipText={description}>{chip}</Tooltip>;
  }

  return chip;
};
