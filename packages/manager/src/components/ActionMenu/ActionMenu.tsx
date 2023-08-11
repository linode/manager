import { Theme } from '@mui/material/styles';
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  MenuPopover,
} from '@reach/menu-button';
import '@reach/menu-button/styles.css';
import { positionRight } from '@reach/popover';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import KebabIcon from 'src/assets/icons/kebab.svg';
import { TooltipIcon } from 'src/components/TooltipIcon';

export interface Action {
  disabled?: boolean;
  onClick: () => void;
  title: string;
  tooltip?: string;
}

const useStyles = makeStyles()((theme: Theme) => ({
  button: {
    '&[data-reach-menu-button]': {
      alignItems: 'center',
      background: 'none',
      border: 'none',
      color: theme.textColors.linkActiveLight,
      cursor: 'pointer',
      display: 'flex',
      fontSize: '1rem',
      padding: '10px',
    },
  },
  disabled: {
    '&[data-reach-menu-item]': {
      color: '#93bcec',
      cursor: 'auto',
    },
    '&[data-reach-menu-item][data-selected]': {
      background: '#3683dc',
      color: '#93bcec',
    },
  },
  icon: {
    '& svg': {
      fill: theme.palette.primary.main,
    },
  },
  item: {
    '&[data-reach-menu-item]': {
      background: '#3683dc',
      borderBottom: '1px solid #5294e0',
      color: '#fff',
      display: 'flex',
      justifyContent: 'space-between',
      padding: theme.spacing(1.25),
      paddingLeft: '16px',
    },
    '&[data-reach-menu-item][data-selected]': {
      background: '#226dc3',
    },
  },
  itemsOuter: {
    '&[data-reach-menu-items]': {
      background: '#3683dc',
      border: 'none',
      color: '#fff',
      fontSize: 14,
      minWidth: 200,
      padding: 0,
      textAlign: 'left',
    },
  },
  popover: {
    zIndex: 1,
  },
  tooltip: {
    '& :hover': {
      color: '#4d99f1',
    },
    '& svg': {
      height: 20,
      width: 20,
    },
    color: '#fff',
    padding: '0 0 0 8px',
  },
}));

export interface Props {
  actionsList: Action[];
  // as they don't have text (just an icon)
  ariaLabel: string;
  // We want to require using aria label for these buttons
  className?: string;
  toggleOpenCallback?: () => void;
}

export const ActionMenu = React.memo((props: Props) => {
  const { classes, cx } = useStyles();
  const { actionsList, toggleOpenCallback } = props;

  const { ariaLabel } = props;

  const handleClick = () => {
    if (toggleOpenCallback) {
      toggleOpenCallback();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (toggleOpenCallback && e.key === 'Enter') {
      toggleOpenCallback();
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
    <Menu>
      <MenuButton
        className={cx({
          [classes.button]: true,
        })}
        aria-label={ariaLabel}
        onKeyDown={handleKeyPress}
        onMouseDown={handleClick}
      >
        <KebabIcon aria-hidden className={classes.icon} type="primary" />
      </MenuButton>
      <MenuPopover className={classes.popover} position={positionRight}>
        <MenuItems className={classes.itemsOuter}>
          {(actionsList as Action[]).map((a, idx) => (
            <MenuItem
              className={cx({
                [classes.disabled]: a.disabled,
                [classes.item]: true,
              })}
              onSelect={() => {
                if (!a.disabled) {
                  return a.onClick();
                }
              }}
              data-qa-action-menu-item={a.title}
              disabled={a.disabled}
              key={idx}
              valueText={a.title}
            >
              {a.title}
              {a.tooltip ? (
                <TooltipIcon
                  data-qa-tooltip-icon
                  status="help"
                  sxTooltipIcon={sxTooltipIcon}
                  text={a.tooltip}
                  tooltipPosition="right"
                />
              ) : null}
            </MenuItem>
          ))}
        </MenuItems>
      </MenuPopover>
    </Menu>
  );
});
