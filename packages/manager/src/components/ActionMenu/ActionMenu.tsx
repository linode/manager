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
import { makeStyles, Theme } from 'src/components/core/styles';

export interface Action {
  title: string;
  disabled?: boolean;
  tooltip?: string;
  isLoading?: boolean;
  ariaDescribedBy?: string;
  onClick: (e: React.MouseEvent<HTMLElement>) => void;
}

const useStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    display: 'inline-block',
    position: 'relative'
  },
  button: {
    '&[data-reach-menu-button]': {
      background: 'none',
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
  icon: {},
  popover: {
    '&[data-reach-menu-popover]': {
      right: 0,
      // Need this to 'merge the button and items wrapper due to the borderRadius on the wrapper
      marginTop: -3
    }
  },
  itemsOuter: {
    '&[data-reach-menu-items]': {
      padding: 0,
      width: 200,
      backgroundColor: '#3683dc',
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
      color: '#fff',
      borderRadius: 3
    },
    '&[data-reach-menu-item][data-selected]': {
      backgroundColor: '#226dc3'
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
}

type CombinedProps = Props;

const ActionMenu: React.FC<CombinedProps> = props => {
  const classes = useStyles();
  const { createActions } = props;

  const [actions, setActions] = React.useState<Action[]>([]);

  React.useEffect(() => {
    setActions(createActions());
  }, [createActions]);

  const { ariaLabel } = props;

  if (typeof actions === 'undefined') {
    return null;
  }

  return (
    <div className={classes.wrapper}>
      <Menu>
        <MenuButton className={classes.button} aria-label={ariaLabel}>
          <MoreHoriz className={classes.icon} type="primary" />
        </MenuButton>
        <MenuPopover className={classes.popover} portal={false}>
          <MenuItems className={classes.itemsOuter}>
            {(actions as Action[]).map((a, idx) => (
              <MenuLink
                key={idx}
                as="a"
                href="#"
                className={classes.item}
                onClick={a.onClick}
                data-qa-action-menu-item={a.title}
              >
                {a.title}
              </MenuLink>
            ))}
          </MenuItems>
        </MenuPopover>
      </Menu>
    </div>
  );
};

export default ActionMenu;
