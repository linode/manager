import { IconButton } from '@mui/material';
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

export interface Props {
  actionsList: Action[];
  // as they don't have text (just an icon)
  ariaLabel: string;
  // We want to require using aria label for these buttons
  className?: string;
  /* A function that is called when the Menu is opened or closed */
  toggleOpenCallback?: () => void;
}

export const ActionMenu = React.memo((props: Props) => {
  const { actionsList, ariaLabel, toggleOpenCallback } = props;

  const menuId = convertToKebabCase(ariaLabel);
  const buttonId = `${convertToKebabCase(ariaLabel)}-button`;

  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    if (toggleOpenCallback) {
      toggleOpenCallback();
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
    if (toggleOpenCallback) {
      toggleOpenCallback();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter') {
      setAnchorEl(e.currentTarget);
      if (toggleOpenCallback) {
        toggleOpenCallback();
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
        onMouseDown={handleClick}
      >
        <KebabIcon />
      </IconButton>
      <Menu
        MenuListProps={{
          'aria-labelledby': buttonId,
        }}
        PaperProps={{
          sx: {
            boxShadow: 'none',
          },
        }}
        anchorOrigin={{
          horizontal: 'right',
          vertical: 'bottom',
        }}
        transformOrigin={{
          horizontal: 'right',
          vertical: 'top',
        }}
        anchorEl={anchorEl}
        id={menuId}
        onClose={handleClose}
        open={open}
      >
        {actionsList.map((a, idx) => (
          <MenuItem
            onClick={() => {
              if (!a.disabled) {
                handleClose();
                a.onClick();
              }
            }}
            sx={(theme) => ({
              '&:hover': {
                background: '#226dc3',
              },
              background: '#3683dc',
              backgroundColor: theme.palette.primary.main,
              borderBottom: '1px solid #5294e0',
              color: '#fff',
              padding: '10px 10px 10px 16px',
            })}
            data-qa-action-menu-item={a.title}
            disabled={a.disabled}
            key={idx}
          >
            {a.title}
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
