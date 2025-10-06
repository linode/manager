import { CircleProgress, convertToKebabCase, TooltipIcon } from '@linode/ui';
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
   * If true, show a loading indicator
   */
  loading?: boolean;
  /**
   * A function that is called when the Menu is opened. Useful for analytics.
   */
  onOpen?: () => void;
  /**
   * If true, stop event propagation when handling clicks
   * Ex: If the action menu is in an accordion, we don't want the click also opening/closing the accordion
   */
  stopClickPropagation?: boolean;
}

/**
 * ## Usage
 *
 * No more than 8 items should be displayed within an action menu.
 */
export const ActionMenu = React.memo((props: ActionMenuProps) => {
  const { actionsList, ariaLabel, loading, onOpen, stopClickPropagation } =
    props;

  const menuId = convertToKebabCase(ariaLabel);
  const buttonId = `${convertToKebabCase(ariaLabel)}-button`;

  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (stopClickPropagation) {
      event.stopPropagation();
    }
    setAnchorEl(event.currentTarget);
    if (onOpen) {
      onOpen();
    }
  };

  const handleClose = (event: React.MouseEvent<HTMLLIElement>) => {
    if (stopClickPropagation) {
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
        aria-controls={open ? menuId : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup="true"
        aria-label={ariaLabel}
        color="inherit"
        id={buttonId}
        loading={loading}
        loadingIndicator={<CircleProgress noPadding size="xs" />}
        onClick={handleClick}
        onKeyDown={handleKeyPress}
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
      >
        <KebabIcon />
      </IconButton>
      {!loading && (
        <Menu
          anchorEl={anchorEl}
          anchorOrigin={{
            horizontal: 'right',
            vertical: 'bottom',
          }}
          data-qa-action-menu
          disableScrollLock
          id={menuId}
          marginThreshold={0}
          MenuListProps={{
            'aria-labelledby': buttonId,
          }}
          onClick={(e) => {
            // Prevents clicks on disabled MenuItems from propagating
            if (stopClickPropagation) {
              e.stopPropagation();
            }
          }}
          onClose={handleClose}
          open={open}
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
          transitionDuration={225}
        >
          {actionsList.map((a, idx) => (
            <MenuItem
              data-qa-action-menu-item={a.title}
              data-testid={a.title}
              disabled={a.disabled}
              key={idx}
              onClick={(e) => {
                if (stopClickPropagation) {
                  e.stopPropagation();
                }
                if (!a.disabled) {
                  handleClose(e);
                  a.onClick();
                }
              }}
              onMouseEnter={handleMouseEnter}
            >
              <ListItemText primaryTypographyProps={{ color: 'inherit' }}>
                {a.title}
              </ListItemText>
              {a.tooltip && (
                <TooltipIcon
                  data-qa-tooltip-icon
                  status="info"
                  sxTooltipIcon={sxTooltipIcon}
                  text={a.tooltip}
                  tooltipPosition="right"
                />
              )}
            </MenuItem>
          ))}
        </Menu>
      )}
    </>
  );
});
