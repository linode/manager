import { styled } from '@mui/material/styles';
import * as React from 'react';

import { Chip } from '../Chip';

import type { ChipProps } from '@mui/material';

export interface BetaChipProps
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
  color?: 'default' | 'primary';
}

/**
 * ## Usage
 *
 * Beta chips label features that are not yet part of Cloud Manager's core supported functionality.<br>
 * **Example:** A beta chip may appear in the [primary navigation](https://github.com/linode/manager/pull/8104#issuecomment-1309334374),
 * breadcrumbs, [banners](/docs/components-notifications-dismissible-banners--beta-banners), tabs, and/or plain text to designate beta functionality.<br>
 * **Visual style:** bold, capitalized text; reduced height, letter spacing, and font size; solid color background.
 *
 */
export const BetaChip = (props: BetaChipProps) => {
  const { color } = props;

  return (
    <StyledBetaChip
      {...props}
      color={color}
      data-testid="betaChip"
      label="beta"
    />
  );
};

const StyledBetaChip = styled(Chip, {
  label: 'StyledBetaChip',
})<BetaChipProps>(({ theme }) => ({
  '& .MuiChip-label': {
    padding: 0,
  },
  background: 'lch(77.7 28.7 275 / 0.12)',
  color: theme.tokens.color.Ultramarine[50],
  font: theme.font.bold,
  fontSize: '0.625rem',
  height: 16,
  letterSpacing: '.25px',
  marginLeft: theme.spacing(),
  padding: theme.spacing(0.5),
  textTransform: 'uppercase',
}));
