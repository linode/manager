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
  > {}

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
  return (
    <StyledNewFeatureChip {...props} data-testid="newFeatureChip" label="new" />
  );
};

const StyledNewFeatureChip = styled(Chip, {
  label: 'StyledNewFeatureChip',
  shouldForwardProp: (prop) => prop !== 'color',
})<NewFeatureChipProps>(({ theme }) => ({
  '& .MuiChip-label': {
    padding: 0,
  },
  background: theme.tokens.component.Badge.Informative.Subtle.Background,
  color: theme.tokens.component.Badge.Pink.Subtle.Text,

  font: theme.font.bold,
  fontSize: '0.625rem',
  height: 16,
  letterSpacing: '.25px',
  marginLeft: theme.spacing(),
  padding: theme.spacing(0.5),
  textTransform: 'uppercase',
}));
