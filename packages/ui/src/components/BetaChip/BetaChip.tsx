import { Global } from '@linode/design-language-system';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { Chip } from '../Chip';

import type { ChipProps } from '@mui/material';

export type BetaChipProps = Omit<
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
>;

/**
 * ## Usage
 *
 * BetaChip is used when a feature is available to a limited number of users as part of a beta rollout.<br>
 * **Example:** A beta chip may appear in the [primary navigation](https://github.com/linode/manager/pull/8104#issuecomment-1309334374),
 * breadcrumbs, [banners](/docs/components-notifications-dismissible-banners--beta-banners), tabs, and/or plain text to designate beta functionality.<br>
 * **Visual style:** bold, capitalized text; reduced height, letter spacing, and font size; solid color background.
 *
 */
export const BetaChip = (props: BetaChipProps) => {
  return <StyledBetaChip {...props} data-testid="betaChip" label="beta" />;
};

export const StyledBetaChip = styled(Chip, {
  label: 'StyledBetaChip',
  shouldForwardProp: (prop) => prop !== 'color',
})<BetaChipProps>(({ theme }) => ({
  '& .MuiChip-label': {
    padding: 0,
  },
  background: Global.Color.Neutrals[70],
  color: Global.Color.Neutrals.White,

  fontWeight: theme.tokens.font.FontWeight.Extrabold,
  fontSize: '11px',
  lineHeight: '12px',
  height: 16,
  letterSpacing: '.22px',
  marginLeft: theme.spacingFunction(8),
  padding: theme.spacingFunction(4),
  textTransform: theme.tokens.font.Textcase.Uppercase,
}));
