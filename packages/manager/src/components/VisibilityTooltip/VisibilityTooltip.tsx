import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { styled } from '@mui/material/styles';
import React from 'react';

import { Button } from '../Button/Button';
import { Tooltip } from '../Tooltip';

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
   * Additional styles to apply to the component.
   */
  sx?: SxProps<Theme>;
}
/**
 * Toggle-able visibility icon with tooltip on hover
 */
export const VisibilityTooltip = (props: Props) => {
  const { handleClick, isVisible, sx } = props;

  return (
    <Tooltip sx={sx} title={!isVisible ? 'Show' : 'Hide'}>
      <StyledToggleButton onClick={handleClick}>
        {!isVisible ? (
          <VisibilityIcon aria-label="Show" />
        ) : (
          <VisibilityOffIcon aria-label="Hide" />
        )}
      </StyledToggleButton>
    </Tooltip>
  );
};

const StyledToggleButton = styled(Button, {
  label: 'StyledToggleButton',
})(({ theme }) => ({
  '& svg': {
    color: theme.palette.grey[500],
    fontSize: '0.875rem',
  },
  fontSize: '0.875rem',
  marginLeft: theme.spacing(),
  minHeight: 'auto',
  minWidth: 'auto',
  padding: 0,
}));
