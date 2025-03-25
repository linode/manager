import { Global } from '@linode/design-language-system';
import { Box, IconButton, Tooltip } from '@linode/ui';
import { Hidden, styled } from '@mui/material';
import React from 'react';

import PinFilledIcon from 'src/assets/icons/pin-filled.svg';
import PinOutlineIcon from 'src/assets/icons/pin-outline.svg';

import {
  PRIMARY_NAV_TOGGLE_HEIGHT,
  SIDEBAR_COLLAPSED_WIDTH,
  SIDEBAR_WIDTH,
} from './constants';

interface PrimaryNavToggleProps {
  areNavItemsOverflowing: boolean;
  desktopMenuToggle: () => void;
  isCollapsed: boolean;
}

export const PrimaryNavToggle = (props: PrimaryNavToggleProps) => {
  const { areNavItemsOverflowing, desktopMenuToggle, isCollapsed } = props;

  return (
    <Hidden mdDown>
      <Box
        sx={() => ({
          backgroundColor: Global.Color.Neutrals[90],
          boxShadow: areNavItemsOverflowing
            ? '0px -4px 8px -2px rgba(30, 30, 30, 0.5)'
            : 'none',
          transition: 'width 100ms linear',
          width: isCollapsed
            ? `${SIDEBAR_COLLAPSED_WIDTH}px`
            : `${SIDEBAR_WIDTH}px`,
        })}
        bottom={0}
        className="primary-nav-toggle"
        display="flex"
        height={PRIMARY_NAV_TOGGLE_HEIGHT}
        justifyContent={isCollapsed ? 'center' : 'flex-end'}
        left={-1}
        position="fixed"
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
    color: Global.Color.Neutrals['White'],
    height: '16px',
    transition: theme.transitions.create(['color']),
    width: '16px',
  },
  padding: theme.tokens.spacing.S16,
}));
