import { Box, IconButton, Tooltip } from '@linode/ui';
import { Hidden, styled } from '@mui/material';
import React from 'react';

import PinFilledIcon from 'src/assets/icons/pin-filled.svg';
import PinOutlineIcon from 'src/assets/icons/pin-outline.svg';
import { TOPMENU_HEIGHT } from 'src/features/TopMenu/constants';

import { SIDEBAR_WIDTH } from './constants';

interface PrimaryNavToggleProps {
  desktopMenuToggle: () => void;
  isCollapsed: boolean;
  isPageScrollable?: boolean;
}

export const PrimaryNavToggle = (props: PrimaryNavToggleProps) => {
  const { desktopMenuToggle, isCollapsed } = props;

  return (
    <Hidden mdDown>
      <Box
        sx={{
          transition: 'left 100ms ease-in-out',
        }}
        position="fixed"
        bottom={0}
        className="primary-nav-toggle"
        display="flex"
        justifyContent="flex-end"
        left={isCollapsed ? 0 : SIDEBAR_WIDTH - 52}
        padding={1}
      >
        <Tooltip
          PopperProps={{
            sx: {
              '& .MuiTooltip-tooltip': {
                padding: '4px 6px',
              },
            },
          }}
          placement="top-end"
          title={isCollapsed ? 'pin side menu' : 'unpin side menu'}
        >
          <StyledIconButton
            sx={{
              left: 1,
            }}
            aria-label="unpin menu"
            data-testid="unpin-nav-menu"
            onClick={desktopMenuToggle}
            size="small"
          >
            {isCollapsed ? <PinOutlineIcon /> : <PinFilledIcon />}
          </StyledIconButton>
        </Tooltip>
      </Box>
    </Hidden>
  );
};

const StyledIconButton = styled(IconButton, {
  label: 'styledIconButton',
})(({ theme }) => ({
  '& svg': {
    color: theme.tokens.sideNavigation.Icon,
    transition: theme.transitions.create(['color']),
  },
}));
