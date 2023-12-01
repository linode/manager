import { IconButton, ListItemText } from '@mui/material';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import * as React from 'react';

import KebabIcon from 'src/assets/icons/kebab.svg';
import { TooltipIcon } from 'src/components/TooltipIcon';
import { convertToKebabCase } from 'src/utilities/convertToKebobCase';

export interface Action {
  disabled?: boolean;
  onClick: () => void;
  title: string;
  tooltip?: string;
}

export interface ActionMenuProps {
  /**
   * A list of actions to show in the Menu
   */
  actionsList: Action[];
  /**
   * Gives the Menu Button an accessible name
   */
  ariaLabel: string;
  /**
   * A function that is called when the Menu is opened. Useful for analytics.
   */
  onOpen?: () => void;
}

/**
 * ## Usage
 *
 * No more than 8 items should be displayed within an action menu.
 */
export const ActionMenu = React.memo((props: ActionMenuProps) => {
  const { actionsList, ariaLabel, onOpen } = props;

  const menuId = convertToKebabCase(ariaLabel);
  const buttonId = `${convertToKebabCase(ariaLabel)}-button`;

  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    if (onOpen) {
      onOpen();
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter') {
      setAnchorEl(e.currentTarget);
      if (onOpen) {
        onOpen();
      }
    }
  };

  if (!actionsList || actionsList.length === 0) {
    return null;
  }

  const sxTooltipIcon = {
    '& .MuiSvgIcon-root': {
      fill: '#fff',
      height: '20px',
      width: '20px',
    },
    '& :hover': {
      color: '#4d99f1',
    },
    color: '#fff',
    padding: '0 0 0 8px',
    pointerEvents: 'all', // Allows the tooltip to be hovered on a disabled MenuItem
  };

  return (
    <>
      <IconButton
        sx={(theme) => ({
          ':hover': {
            backgroundColor: theme.palette.primary.main,
            color: '#fff',
          },
          backgroundColor: open ? theme.palette.primary.main : undefined,
          borderRadius: 'unset',
          color: open ? '#fff' : theme.textColors.linkActiveLight,
          height: '100%',
          minWidth: '40px',
          padding: '10px',
        })}
        aria-controls={open ? menuId : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup="true"
        aria-label={ariaLabel}
        color="inherit"
        id={buttonId}
        onClick={handleClick}
        onKeyDown={handleKeyPress}
      >
        <KebabIcon />
      </IconButton>
      <Menu
        MenuListProps={{
          'aria-labelledby': buttonId,
        }}
        anchorOrigin={{
          horizontal: 'right',
          vertical: 'bottom',
        }}
        slotProps={{
          paper: {
            sx: (theme) => ({
              backgroundColor: theme.palette.primary.main,
              boxShadow: 'none',
            }),
          },
        }}
        transformOrigin={{
          horizontal: 'right',
          vertical: 'top',
        }}
        anchorEl={anchorEl}
        data-qa-action-menu
        disableScrollLock
        id={menuId}
        marginThreshold={0}
        onClose={handleClose}
        open={open}
        transitionDuration={225}
      >
        {actionsList.map((a, idx) => (
          <MenuItem
            onClick={() => {
              if (!a.disabled) {
                handleClose();
                a.onClick();
              }
            }}
            sx={{
              '&:hover': {
                background: '#226dc3',
              },
              background: '#3683dc',
              borderBottom: '1px solid #5294e0',
              color: '#fff',
              padding: '10px 10px 10px 16px',
            }}
            data-qa-action-menu-item={a.title}
            disabled={a.disabled}
            key={idx}
          >
            <ListItemText primaryTypographyProps={{ color: 'inherit' }}>
              {a.title}
            </ListItemText>
            {a.tooltip && (
              <TooltipIcon
                data-qa-tooltip-icon
                status="help"
                sxTooltipIcon={sxTooltipIcon}
                text={a.tooltip}
                tooltipPosition="right"
              />
            )}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
});
