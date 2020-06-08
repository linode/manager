import * as classNames from 'classnames';
import HelpOutline from '@material-ui/icons/HelpOutline';
import MoreHoriz from '@material-ui/icons/MoreHoriz';
import {
  Menu,
  MenuButton,
  MenuItems,
  MenuLink,
  MenuPopover
} from '@reach/menu-button';
import '@reach/menu-button/styles.css';
import * as React from 'react';
import IconButton from 'src/components/core/IconButton';
import { makeStyles, Theme } from 'src/components/core/styles';

export interface Action {
  title: string;
  disabled?: boolean;
  tooltip?: string;
  onClick: (e: React.MouseEvent<HTMLElement>) => void;
}

const useStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    display: 'inline-block',
    position: 'relative'
  },
  button: {
    '&[data-reach-menu-button]': {
      display: 'flex',
      alignItems: 'center',
      background: 'none',
      fontSize: '1rem',
      fontWeight: 'bold',
      border: 'none',
      padding: theme.spacing(1) + 2,
      color: '#3683dc',
      cursor: 'pointer',
      '&[aria-expanded="true"]': {
        backgroundColor: '#3683dc',
        color: '#fff'
      }
    }
  },
  buttonLabel: {
    margin: `0 0 0 ${theme.spacing()}px`
  },
  icon: {},
  popover: {
    '&[data-reach-menu-popover]': {
      right: 0,
      // Need this to 'merge the button and items wrapper due to the borderRadius on the wrapper
      marginTop: -3,
      zIndex: 1
    }
  },
  itemsOuter: {
    '&[data-reach-menu-items]': {
      padding: 0,
      width: 200,
      background: '#3683dc',
      borderRadius: 3,
      border: 'none',
      fontSize: 14,
      color: '#fff',
      textAlign: 'left'
    }
  },
  item: {
    '&[data-reach-menu-item]': {
      padding: theme.spacing(1) + 2,
      borderBottom: '1px solid #5294e0',
      background: '#3683dc',
      color: '#fff',
      borderRadius: 3
    },
    '&[data-reach-menu-item][data-selected]': {
      background: '#226dc3'
    }
  },
  disabled: {
    '&[data-reach-menu-item]': {
      color: '#93bcec',
      cursor: 'auto'
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
  const { createActions } = props;

  const [actions, setActions] = React.useState<Action[]>([]);

  React.useEffect(() => {
    setActions(createActions());
  }, [createActions]);

  const { ariaLabel, inlineLabel } = props;

  if (typeof actions === 'undefined') {
    return null;
  }

  return (
    <div className={classes.wrapper}>
      <Menu>
        <MenuButton className={classes.button} aria-label={ariaLabel}>
          <MoreHoriz aria-hidden className={classes.icon} type="primary" />
          {inlineLabel && <p className={classes.buttonLabel}>{inlineLabel}</p>}
        </MenuButton>
        <MenuPopover className={classes.popover} portal={false}>
          <MenuItems className={classes.itemsOuter}>
            {(actions as Action[]).map((a, idx) => (
              <MenuLink
                key={idx}
                className={classNames({
                  [classes.item]: true,
                  [classes.disabled]: a.disabled
                })}
                onClick={a.onClick}
                data-qa-action-menu-item={a.title}
                // disabled={a.disabled}
              >
                {a.title}
                {a.tooltip && (
                  <IconButton
                    // className={classes.helpButton}
                    // onClick={handleClick}
                    data-qa-tooltip-icon
                  >
                    <HelpOutline />
                  </IconButton>
                )}
                {/* {a.tooltip && <span data-qa-tooltip>{a.tooltip}</span>} */}
              </MenuLink>
            ))}
          </MenuItems>
        </MenuPopover>
      </Menu>
    </div>
  );
};

export default ActionMenu;
