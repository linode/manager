import * as classNames from 'classnames';
import KebabIcon from 'src/assets/icons/kebab.svg';
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  MenuPopover
} from '@reach/menu-button';
import '@reach/menu-button/styles.css';
import { positionRight } from '@reach/popover';
import * as React from 'react';
import HelpIcon from 'src/components/HelpIcon';
import { makeStyles, Theme } from 'src/components/core/styles';

export interface Action {
  title: string;
  disabled?: boolean;
  tooltip?: string;
  onClick: () => void;
}

const useStyles = makeStyles((theme: Theme) => ({
  wrapper: {},
  button: {
    '&[data-reach-menu-button]': {
      display: 'flex',
      alignItems: 'center',
      background: 'none',
      fontSize: '1rem',
      border: 'none',
      padding: '10px',
      color: theme.cmrIconColors.iActiveLight,
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: '#3683dc',
        color: '#fff'
      },
      '&[aria-expanded="true"]': {
        backgroundColor: '#3683dc',
        color: '#fff'
      }
    }
  },
  buttonWithLabel: {
    padding: '15px 10px !important'
  },
  buttonLabel: {
    margin: `0 0 0 ${theme.spacing() + 2}px`,
    fontFamily: theme.font.normal,
    lineHeight: 1
  },
  icon: {
    '& svg': {
      fill: theme.color.blue
    }
  },
  popover: {
    zIndex: 1
  },
  itemsOuter: {
    '&[data-reach-menu-items]': {
      padding: 0,
      width: 200,
      background: '#3683dc',
      border: 'none',
      fontSize: 14,
      color: '#fff',
      textAlign: 'left'
    }
  },
  item: {
    '&[data-reach-menu-item]': {
      display: 'flex',
      justifyContent: 'space-between',
      padding: theme.spacing(1) + 2,
      paddingLeft: '16px',
      borderBottom: '1px solid #5294e0',
      background: '#3683dc',
      color: '#fff'
    },
    '&[data-reach-menu-item][data-selected]': {
      background: '#226dc3'
    }
  },
  disabled: {
    '&[data-reach-menu-item]': {
      color: '#93bcec',
      cursor: 'auto'
    },
    '&[data-reach-menu-item][data-selected]': {
      background: '#3683dc',
      color: '#93bcec'
    }
  },
  tooltip: {
    color: theme.color.white,
    padding: '0 0 0 8px',
    '& svg': {
      height: 20,
      width: 20
    }
  }
}));

export interface Props {
  createActions: () => Action[];
  toggleOpenCallback?: () => void;
  // we want to require using aria label for these buttons
  // as they don't have text (just an icon)
  ariaLabel: string;
  className?: string;
  disabled?: boolean;
  // Displays inline next to the button icon
  inlineLabel?: string;
}

type CombinedProps = Props;

const ActionMenu: React.FC<CombinedProps> = props => {
  const classes = useStyles();
  const { createActions, toggleOpenCallback } = props;

  const [actions, setActions] = React.useState<Action[]>([]);

  React.useEffect(() => {
    setActions(createActions());
  }, [createActions]);

  const { ariaLabel, inlineLabel } = props;

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

  if (typeof actions === 'undefined') {
    return null;
  }

  return (
    <div className={classes.wrapper}>
      <Menu>
        <MenuButton
          className={classNames({
            [classes.button]: true,
            [classes.buttonWithLabel]: Boolean(inlineLabel)
          })}
          aria-label={ariaLabel}
          onMouseDown={handleClick}
          onKeyDown={handleKeyPress}
        >
          <KebabIcon aria-hidden className={classes.icon} type="primary" />
          {inlineLabel && <p className={classes.buttonLabel}>{inlineLabel}</p>}
        </MenuButton>
        <MenuPopover className={classes.popover} position={positionRight}>
          <MenuItems className={classes.itemsOuter}>
            {(actions as Action[]).map((a, idx) => (
              <MenuItem
                key={idx}
                className={classNames({
                  [classes.item]: true,
                  [classes.disabled]: a.disabled
                })}
                onSelect={() => {
                  if (!a.disabled) {
                    return a.onClick();
                  }
                }}
                data-qa-action-menu-item={a.title}
                disabled={a.disabled}
              >
                {a.title}
                {a.tooltip && (
                  <HelpIcon
                    data-qa-tooltip-icon
                    text={a.tooltip}
                    tooltipPosition="right"
                    className={classes.tooltip}
                  />
                )}
              </MenuItem>
            ))}
          </MenuItems>
        </MenuPopover>
      </Menu>
    </div>
  );
};

export default ActionMenu;
