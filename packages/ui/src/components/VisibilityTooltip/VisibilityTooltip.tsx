import VisibilityShowIcon from 'src/assets/icons/visibilityShow.svg';
import VisibilityHideIcon from 'src/assets/icons/visibilityHide.svg';

import { styled } from '@mui/material/styles';
import React from 'react';

import type { SxProps, Theme } from '@mui/material/styles';
import { IconButton } from '../IconButton';
import { Tooltip, TooltipProps } from '../Tooltip';

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
   * Additional styles to apply to the component.
   */
  sx?: SxProps<Theme>;
  /**
   * The placement of the tooltip.
   */
  placement?: TooltipProps['placement'];
  /**
   * Optionally, display the label text for the toggle button.
   */
  label?: string | JSX.Element;
}
/**
 * Toggle-able visibility icon with tooltip on hover
 */
export const VisibilityTooltip = (props: Props) => {
  const { handleClick, isVisible, label, sx, placement } = props;

  return (
    <Tooltip
      sx={sx}
      title={!isVisible ? 'Show' : 'Hide'}
      disableInteractive
      placement={placement ?? 'top'}
    >
      <StyledToggleButton onClick={handleClick}>
        {!isVisible ? (
          <VisibilityShowIcon aria-label="Show" />
        ) : (
          <VisibilityHideIcon aria-label="Hide" />
        )}
        {label}
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
