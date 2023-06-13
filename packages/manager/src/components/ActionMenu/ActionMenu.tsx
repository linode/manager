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
import KebabIcon from 'src/assets/icons/kebab.svg';
import { TooltipIcon } from 'src/components/TooltipIcon/TooltipIcon';
import { makeStyles } from 'tss-react/mui';

export interface Action {
  title: string;
  disabled?: boolean;
  tooltip?: string;
  onClick: () => void;
}

const useStyles = makeStyles()((theme: Theme) => ({
  button: {
    '&[data-reach-menu-button]': {
      display: 'flex',
      alignItems: 'center',
      background: 'none',
      fontSize: '1rem',
      border: 'none',
      padding: '10px',
      color: theme.textColors.linkActiveLight,
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: '#3683dc',
        color: '#fff',
      },
      '&[aria-expanded="true"]': {
        backgroundColor: '#3683dc',
        color: '#fff',
      },
    },
  },
  icon: {
    '& svg': {
      fill: theme.palette.primary.main,
    },
  },
  popover: {
    zIndex: 1,
  },
  itemsOuter: {
    '&[data-reach-menu-items]': {
      padding: 0,
      minWidth: 200,
      background: '#3683dc',
      border: 'none',
      fontSize: 14,
      color: '#fff',
      textAlign: 'left',
    },
  },
  item: {
    '&[data-reach-menu-item]': {
      display: 'flex',
      justifyContent: 'space-between',
      padding: theme.spacing(1.25),
      paddingLeft: '16px',
      borderBottom: '1px solid #5294e0',
      background: '#3683dc',
      color: '#fff',
    },
    '&[data-reach-menu-item][data-selected]': {
      background: '#226dc3',
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
  tooltip: {
    color: '#fff',
    '& :hover': {
      color: '#4d99f1',
    },
    padding: '0 0 0 8px',
    '& svg': {
      height: 20,
      width: 20,
    },
  },
}));

export interface Props {
  actionsList: Action[];
  toggleOpenCallback?: () => void;
  // We want to require using aria label for these buttons
  // as they don't have text (just an icon)
  ariaLabel: string;
  className?: string;
}

const ActionMenu = (props: Props) => {
  const { classes, cx } = useStyles();
  const { toggleOpenCallback, actionsList } = props;

  const { ariaLabel } = props;

  const handleClick = () => {
    if (toggleOpenCallback) {
      toggleOpenCallback();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (toggleOpenCallback && e.keyCode === 13) {
      toggleOpenCallback();
    }
  };

  if (!actionsList || actionsList.length === 0) {
    return null;
  }

  const sxTooltipIcon = {
    color: '#fff',
    '& :hover': {
      color: '#4d99f1',
    },
    padding: '0 0 0 8px',
    '& svg': {
      height: '20px',
      width: '20px',
    },
  };

  return (
    <Menu>
      <MenuButton
        className={cx({
          [classes.button]: true,
        })}
        aria-label={ariaLabel}
        onMouseDown={handleClick}
        onKeyDown={handleKeyPress}
      >
        <KebabIcon aria-hidden className={classes.icon} type="primary" />
      </MenuButton>
      <MenuPopover className={classes.popover} position={positionRight}>
        <MenuItems className={classes.itemsOuter}>
          {(actionsList as Action[]).map((a, idx) => (
            <MenuItem
              key={idx}
              className={cx({
                [classes.item]: true,
                [classes.disabled]: a.disabled,
              })}
              onSelect={() => {
                if (!a.disabled) {
                  return a.onClick();
                }
              }}
              data-qa-action-menu-item={a.title}
              disabled={a.disabled}
              valueText={a.title}
            >
              {a.title}
              {a.tooltip ? (
                <TooltipIcon
                  data-qa-tooltip-icon
                  text={a.tooltip}
                  tooltipPosition="right"
                  sxTooltipIcon={sxTooltipIcon}
                  status="help"
                />
              ) : null}
            </MenuItem>
          ))}
        </MenuItems>
      </MenuPopover>
    </Menu>
  );
};

export default React.memo(ActionMenu);
