import { styled } from '@mui/material/styles';
import * as React from 'react';

import { Chip } from '../Chip';

import type { ChipProps } from '@mui/material';

export interface NewFeatureChipProps
  extends Omit<
    ChipProps,
    | 'avatar'
    | 'clickable'
    | 'deleteIcon'
    | 'disabled'
    | 'icon'
    | 'label'
    | 'onDelete'
    | 'outlineColor'
    | 'size'
    | 'variant'
  > {
  /**
   * The color of the chip.
   * default renders a gray chip, primary renders a blue chip.
   */
  color?: 'primary' | 'secondary';
}

/**
 * ## Usage
 *
 * NewFeatureChip chips label features that are not yet part of Cloud Manager's core supported functionality.<br>
 * **Example:** A NewFeatureChip chip may appear in the primary navigation,
 * breadcrumbs, banners, tabs, and/or plain text to designate new functionality.<br>
 * **Visual style:** bold, capitalized text; reduced height, letter spacing, and font size; solid color background.
 *
 */
export const NewFeatureChip = (props: NewFeatureChipProps) => {
  const { color = 'primary' } = props;

  return (
    <StyledNewFeatureChip
      {...props}
      color={color}
      data-testid="newFeatureChip"
      label="new"
    />
  );
};

const StyledNewFeatureChip = styled(Chip, {
  label: 'StyledNewFeatureChip',
  shouldForwardProp: (prop) => prop !== 'color',
})<NewFeatureChipProps>(({ color, theme }) => ({
  '& .MuiChip-label': {
    padding: 0,
  },
  background:
    color === 'primary'
      ? 'lch(77.7 28.7 275 / 0.12)'
      : theme.tokens.color.Neutrals[60],
  color:
    color === 'primary'
      ? theme.tokens.color.Ultramarine[50]
      : theme.tokens.color.Neutrals.White,

  font: theme.font.bold,
  fontSize: '0.625rem',
  height: 16,
  letterSpacing: '.25px',
  marginLeft: theme.spacing(),
  padding: theme.spacing(0.5),
  textTransform: 'uppercase',
}));
