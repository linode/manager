import { styled } from '@mui/material/styles';
import React from 'react';

import { VisibilityHideIcon, VisibilityShowIcon } from '../../assets/icons';
import { IconButton } from '../IconButton';
import { Tooltip } from '../Tooltip';

import type { TooltipProps } from '../Tooltip';
import type { SxProps, Theme } from '@mui/material/styles';

interface Props {
  /**
   * Toggles visibility icon on click
   */
  handleClick: () => void;
  /**
   * If true, displays the icon to toggle visibility to hidden; if false, displays the icon to toggle visibility to shown.
   */
  isVisible: boolean;
  /**
   * The placement of the tooltip.
   */
  placement?: TooltipProps['placement'];
  /**
   * Additional styles to apply to the component.
   */
  sx?: SxProps<Theme>;
}
/**
 * Toggle-able visibility icon with tooltip on hover
 */
export const VisibilityTooltip = (props: Props) => {
  const { handleClick, isVisible, placement, sx } = props;

  return (
    <Tooltip
      data-testid="VisibilityTooltip"
      disableInteractive
      placement={placement ?? 'top'}
      sx={sx}
      title={!isVisible ? 'Show' : 'Hide'}
    >
      <StyledToggleButton onClick={handleClick}>
        {!isVisible ? (
          <VisibilityShowIcon aria-label="Show" />
        ) : (
          <VisibilityHideIcon aria-label="Hide" />
        )}
      </StyledToggleButton>
    </Tooltip>
  );
};

const StyledToggleButton = styled(IconButton, {
  label: 'StyledToggleButton',
})(({ theme }) => ({
  '& svg': {
    '& path': {
      stroke: theme.palette.grey[500],
    },
  },
  '& svg:hover': {
    '& path': {
      stroke: theme.palette.primary.main,
    },
  },
  marginLeft: theme.spacing(),
  minHeight: 'auto',
  minWidth: 'auto',
  padding: 0,
}));
