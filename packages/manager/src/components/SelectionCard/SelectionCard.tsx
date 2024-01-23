import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';
import { SxProps } from '@mui/system';
import * as React from 'react';

import { Tooltip } from 'src/components/Tooltip';

import { CardBase } from './CardBase';

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
   * If true, the card will be disabled and will be displayed in a disabled state.
   * @default false
   */
  disabled?: boolean;
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
  sx?: SxProps;
  /**
   * Optional styles to apply to the root element of the card.
   */
  sxCardBase?: SxProps;
  /**
   * Optional styles to apply to the heading of the card.
   */
  sxCardBaseHeading?: SxProps;
  /**
   * Optional styles to apply to the icon of the card.
   */
  sxCardBaseIcon?: SxProps;
  /**
   * Optional styles to apply to the subheading of the card.
   */
  sxCardBaseSubheading?: SxProps;
  /**
   * Optional styles to apply to the grid of the card.
   */
  sxGrid?: SxProps;
  /**
   * Optional styles to apply to the tooltip of the card.
   */
  sxTooltip?: SxProps;
  /**
   * Optional text to set in a tooltip when hovering over the card.
   */
  tooltip?: string;
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
    tooltip,
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
      disabled={disabled}
      id={id}
      lg={4}
      onClick={handleClick}
      onKeyPress={handleKeyPress}
      sm={6}
      sx={sxGrid}
      tabIndex={0}
      xl={3}
      xs={12}
    >
      {content}
    </StyledGrid>
  );

  if (tooltip) {
    return (
      <Tooltip placement="top" title={tooltip}>
        {cardGrid}
      </Tooltip>
    );
  }

  return cardGrid;
});

const StyledGrid = styled(Grid, {
  label: 'SelectionCardGrid',
})<Partial<SelectionCardProps>>(({ ...props }) => ({
  '& [class^="fl-"]': {
    transition: 'color 225ms ease-in-out',
  },
  '&:focus': {
    outline: '1px dotted #999',
  },
  ...(props.onClick &&
    !props.disabled && {
      cursor: 'pointer',
    }),
  ...(props.disabled && {
    '& > div': {
      opacity: 0.4,
    },
    cursor: 'not-allowed',
  }),
}));
