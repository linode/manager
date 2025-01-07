import { Box, IconButton, Tooltip } from '@linode/ui';
import { useScrollTrigger } from '@mui/material';
import { Hidden, styled } from '@mui/material';
import React from 'react';

import PinFilledIcon from 'src/assets/icons/pin-filled.svg';
import PinOutlineIcon from 'src/assets/icons/pin-outline.svg';
import { FOOTER_HEIGHT } from 'src/features/Footer';

import { SIDEBAR_WIDTH } from './constants';

interface PrimaryNavToggleProps {
  desktopMenuToggle: () => void;
  isCollapsed: boolean;
}

export const PrimaryNavToggle = (props: PrimaryNavToggleProps) => {
  const { desktopMenuToggle, isCollapsed } = props;

  const isPageAtBottom = useScrollTrigger({
    disableHysteresis: true,
    threshold: window.innerHeight,
  });

  return (
    <Hidden mdDown>
      <Box
        sx={{
          bottom: isPageAtBottom ? FOOTER_HEIGHT : 0,
          left: isCollapsed ? 0 : SIDEBAR_WIDTH - 52,
          padding: 1,
          position: 'fixed',
          transition: 'bottom 0.1s linear',
        }}
      >
        <Tooltip
          PopperProps={{
            sx: {
              '& .MuiTooltip-tooltip': {
                padding: '4px 6px',
              },
            },
          }}
          placement="left"
          title={isCollapsed ? 'pin side menu' : 'unpin side menu'}
        >
          <StyledIconButton
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
