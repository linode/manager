import React, { useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import {
  Box,
  Button,
  Menu,
  MenuItem,
  IconButton,
  useMediaQuery,
} from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { MenuAction } from './actionData';

interface MenuActionsProps {
  actions: MenuAction[];
}

const ActionButton = styled(Button)(() => ({
  textTransform: 'none',
}));

export const MenuActions: React.FC<MenuActionsProps> = ({ actions }) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTabletLarge = useMediaQuery(
    theme.breakpoints.between('dl_tablet950', 'md')
  );
  const isDesktop1030 = useMediaQuery(theme.breakpoints.up('dl_desktop1030'));

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleActionClick = (action: MenuAction) => {
    action.onClick();
    handleClose();
  };

  let visibleActionsCount = 0;

  if (isMobile) {
    visibleActionsCount = 0;
  } else if (isTabletLarge || isDesktop1030) {
    visibleActionsCount = 3;
  } else {
    visibleActionsCount = 1;
  }

  const visibleActions = actions.slice(0, visibleActionsCount);
  const menuActions = actions.slice(visibleActionsCount);

  return (
    <Box
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}
    >
      {visibleActions.map((action, index) => (
        <ActionButton key={index} size="small" onClick={action.onClick}>
          {action.label}
        </ActionButton>
      ))}

      {menuActions.length > 0 && (
        <>
          <IconButton onClick={handleClick} size="small">
            <MoreHorizIcon />
          </IconButton>
          <Menu
            id="actions-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            {menuActions.map((action, index) => (
              <MenuItem key={index} onClick={() => handleActionClick(action)}>
                {action.label}
              </MenuItem>
            ))}
          </Menu>
        </>
      )}
    </Box>
  );
};

export default MenuActions;
