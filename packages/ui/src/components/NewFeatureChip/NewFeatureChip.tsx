import { styled } from '@mui/material/styles';
import { Global } from '@linode/design-language-system';
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
 * The NewFeatureChip is displayed to all users after the feature has been fully rolled out.<br>
 * **Example:** A NewFeatureChip chip may appear in the primary navigation,
 * breadcrumbs, banners, tabs, and/or plain text to designate new functionality and improve visibility for all the users.<br>
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
  background: Global.Color.Violet[70],
  color: Global.Color.Neutrals.White,

  font: theme.font.bold,
  fontSize: '11px',
  fontWeight: theme.tokens.font.FontWeight.Extrabold,
  lineHeight: '12px',
  height: 16,
  letterSpacing: '.22px',
  marginLeft: theme.spacingFunction(8),
  padding: theme.spacingFunction(4),
  textTransform: theme.tokens.font.Textcase.Uppercase,
}));
