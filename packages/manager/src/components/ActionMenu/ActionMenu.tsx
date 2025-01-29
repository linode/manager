import { TooltipIcon, convertToKebabCase } from '@linode/ui';
import { IconButton, ListItemText } from '@mui/material';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import * as React from 'react';

import KebabIcon from 'src/assets/icons/kebab.svg';

export interface Action {
  disabled?: boolean;
  id?: string;
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
   * If true, stop event propagation when handling clicks so that clicks don't open/close the accordion
   */
  isInAccordionHeader?: boolean;
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
  const { actionsList, ariaLabel, isInAccordionHeader, onOpen } = props;

  const menuId = convertToKebabCase(ariaLabel);
  const buttonId = `${convertToKebabCase(ariaLabel)}-button`;

  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (isInAccordionHeader) {
      event.stopPropagation();
    }
    setAnchorEl(event.currentTarget);
    if (onOpen) {
      onOpen();
    }
  };

  const handleClose = (event: React.MouseEvent<HTMLLIElement>) => {
    if (isInAccordionHeader) {
      event.stopPropagation();
    }
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
        {actionsList.map((a, idx) => (
          <MenuItem
            onClick={(e) => {
              if (!a.disabled) {
                handleClose(e);
                a.onClick();
              }
            }}
            data-qa-action-menu-item={a.title}
            data-testid={a.title}
            disabled={a.disabled}
            key={idx}
            onMouseEnter={handleMouseEnter}
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
