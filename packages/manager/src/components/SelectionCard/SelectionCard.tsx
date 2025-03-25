import { Tooltip } from '@linode/ui';
import { styled } from '@mui/material/styles';
import Grid, { Grid2Props } from '@mui/material/Grid2';
import * as React from 'react';

import { CardBase } from './CardBase';

import type { TooltipProps } from '@linode/ui';
import type { SxProps, Theme } from '@mui/material/styles';

export interface SelectionCardProps {
  /**
   * If true, the card will be selected and displayed as in a selected state.
   * @default false
   */
  checked?: boolean;
  /**
   * Additional CSS classes to apply to the root element.
   */
  className?: string;
  /**
   * An optional custom data-testid
   * @default selection-card
   */
  'data-testid'?: string;
  /**
   * If true, the card will be disabled and will be displayed in a disabled state.
   * @default false
   */
  disabled?: boolean;
  /**
   * Optionally override the grid item's size
   * @default { lg: 4, sm: 6, xl: 3, xs: 12 }
   */
  gridSize?: Grid2Props['size'];
  /**
   * The heading of the card.
   * @example Linode 1GB
   */
  heading: string;
  /**
   * An optional decoration to display next to the heading.
   * @example (Current)
   */
  headingDecoration?: JSX.Element;
  /**
   * The ID of the card.
   */
  id?: string;
  /**
   * Callback fired when the card is clicked.
   * @param {React.SyntheticEvent} e The event source of the callback.
   */
  onClick?: (e: React.SyntheticEvent<HTMLElement>) => void;
  /**
   * An optional icon to render on the left side.
   * @example <LinodeIcon />
   */
  renderIcon?: () => JSX.Element;
  /**
   * An optional variant to render on the right side.
   */
  renderVariant?: () => JSX.Element | null;
  /**
   * An array of subheadings to display below the heading.
   * @example ['Linode 1GB', 'Linode 2GB', 'Linode 4GB']
   */
  subheadings: (JSX.Element | string | undefined)[];
  /**
   * Optional styles to apply to the root element.
   */
  sx?: SxProps<Theme>;
  /**
   * Optional styles to apply to the root element of the card.
   */
  sxCardBase?: SxProps<Theme>;
  /**
   * Optional styles to apply to the heading of the card.
   */
  sxCardBaseHeading?: SxProps<Theme>;
  /**
   * Optional styles to apply to the icon of the card.
   */
  sxCardBaseIcon?: SxProps<Theme>;
  /**
   * Optional styles to apply to the subheading of the card.
   */
  sxCardBaseSubheading?: SxProps<Theme>;
  /**
   * Optional styles to apply to the grid of the card.
   */
  sxGrid?: SxProps<Theme>;
  /**
   * Optional styles to apply to the tooltip of the card.
   */
  sxTooltip?: SxProps<Theme>;
  /**
   * Optional text to set in a tooltip when hovering over the card.
   */
  tooltip?: JSX.Element | string;
  /**
   * The placement of the tooltip
   * @default top
   */
  tooltipPlacement?: TooltipProps['placement'];
}

/**
 * Tables used for selecting an item become cards at a breakpoint (e.g., plans on the Create Linode page and Linodes on the Clone Linode page).
 *
 * - Cards are used as a compact presentation of data that is mobile-friendly.
 * - ** Important**: Do not use cards if comparing or scanning data points is important. Tables, even compact ones are better suited to this use case.
 */
export const SelectionCard = React.memo((props: SelectionCardProps) => {
  const {
    checked,
    className,
    disabled,
    gridSize,
    heading,
    headingDecoration,
    id,
    onClick,
    renderIcon,
    renderVariant,
    subheadings,
    sxCardBase,
    sxCardBaseHeading,
    sxCardBaseIcon,
    sxCardBaseSubheading,
    sxGrid,
    sxTooltip,
    tooltip,
    tooltipPlacement = 'top',
  } = props;

  const handleKeyPress = (e: React.KeyboardEvent<HTMLElement>) => {
    if (onClick && !disabled) {
      e.preventDefault();
      onClick(e);
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    if (onClick && !disabled) {
      onClick(e);
    }
  };

  const content = (
    <CardBase
      checked={checked}
      heading={heading}
      headingDecoration={headingDecoration}
      renderIcon={renderIcon}
      renderVariant={renderVariant}
      subheadings={subheadings}
      sx={sxCardBase}
      sxHeading={sxCardBaseHeading}
      sxIcon={sxCardBaseIcon}
      sxSubheading={sxCardBaseSubheading}
    />
  );

  const cardGrid = (
    <StyledGrid
      className={className}
      data-qa-selection-card
      data-qa-selection-card-checked={checked}
      data-testid={props['data-testid'] ?? 'selection-card'}
      disabled={disabled}
      id={id}
      onClick={handleClick}
      onKeyPress={handleKeyPress}
      size={gridSize ?? { lg: 4, sm: 6, xl: 3, xs: 12 }}
      sx={sxGrid}
      tabIndex={0}
    >
      {content}
    </StyledGrid>
  );

  if (tooltip) {
    return (
      <Tooltip
        componentsProps={{
          tooltip: { sx: sxTooltip },
        }}
        placement={tooltipPlacement}
        title={tooltip}
      >
        {cardGrid}
      </Tooltip>
    );
  }

  return cardGrid;
});

const StyledGrid = styled(Grid, {
  label: 'SelectionCardGrid',
})<Partial<SelectionCardProps>>(({ theme, ...props }) => ({
  '& [class^="fl-"]': {
    transition: 'color 225ms ease-in-out',
  },
  '&:focus': {
    outline: `1px dotted ${theme.tokens.color.Neutrals[50]}`,
  },
  ...(props.onClick &&
    !props.disabled && {
      cursor: 'pointer',
    }),
  ...(props.disabled && {
    '& .cardSubheadingItem, & .cardSubheadingTitle, & p': {
      opacity: 0.3,
    },
    cursor: 'not-allowed',
  }),
}));
