import { TooltipIcon, convertToKebabCase } from '@linode/ui';
import { IconButton, ListItemText } from '@mui/material';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import * as React from 'react';

import KebabIcon from 'src/assets/icons/kebab.svg';

import { TanstackMenuItemLink } from '../TanstackLinks';

export interface Action<T = undefined> {
  action?: T;
  disabled?: boolean;
  id?: string;
  onClick: () => void;
  title: string;
  tooltip?: string;
}

export interface ActionMenuProps<T = undefined> {
  /**
   * A list of actions to show in the Menu
   */
  actionsList: Action<T>[];
  /**
   * Gives the Menu Button an accessible name
   */
  ariaLabel: string;
  /**
   * A function that is called when the Menu is opened. Useful for analytics.
   */
  onOpen?: () => void;
  /**
   * Optional tanstackRouter props
   */
  useTanstackRouter?: boolean;
}

/**
 * ## Usage
 *
 * No more than 8 items should be displayed within an action menu.
 */
export const ActionMenu = React.memo(function ActionMenu<T = undefined>(
  props: ActionMenuProps<T>
) {
  const { actionsList, ariaLabel, onOpen, useTanstackRouter } = props;

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

  const handleMouseEnter = (e: React.MouseEvent<HTMLElement>) =>
    e.currentTarget.focus();

  if (!actionsList || actionsList.length === 0) {
    return null;
  }

  const sxTooltipIcon = {
    padding: '0 0 0 8px',
    pointerEvents: 'all', // Allows the tooltip to be hovered on a disabled MenuItem
  };

  const MenuItemContent = (a: Action<T>) => {
    return (
      <>
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
      </>
    );
  };

  return (
    <>
      <IconButton
        sx={(theme) => ({
          ':hover': {
            backgroundColor: theme.color.buttonPrimaryHover,
            color: theme.color.white,
          },
          backgroundColor: open ? theme.color.buttonPrimaryHover : undefined,
          borderRadius: 'unset',
          color: open ? theme.color.white : theme.textColors.linkActiveLight,
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
        {actionsList.map((a, idx) =>
          useTanstackRouter ? (
            <TanstackMenuItemLink
              data-qa-action-menu-item={a.title}
              data-testid={a.title}
              key={idx}
              linkType="link"
              onMouseEnter={handleMouseEnter}
              to={`/volumes/${a.id}/${a.action}`}
            >
              <MenuItemContent {...a} />
            </TanstackMenuItemLink>
          ) : (
            <MenuItem
              onClick={() => {
                if (!a.disabled) {
                  handleClose();
                  a.onClick();
                }
              }}
              data-qa-action-menu-item={a.title}
              data-testid={a.title}
              disabled={a.disabled}
              key={idx}
              onMouseEnter={handleMouseEnter}
            >
              <MenuItemContent {...a} />
            </MenuItem>
          )
        )}
      </Menu>
    </>
  );
});
