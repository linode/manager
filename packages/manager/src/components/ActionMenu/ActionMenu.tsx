import MoreHoriz from '@material-ui/icons/MoreHoriz';
import * as React from 'react';
import IconButton from 'src/components/core/IconButton';
import Menu from 'src/components/core/Menu';
import { makeStyles, Theme } from 'src/components/core/styles';
import MenuItem from 'src/components/MenuItem';

export interface Action {
  title: string;
  disabled?: boolean;
  tooltip?: string;
  isLoading?: boolean;
  ariaDescribedBy?: string;
  onClick: (e: React.MouseEvent<HTMLElement>) => void;
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  item: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingTop: theme.spacing(1) * 1.5,
    paddingBottom: theme.spacing(1) * 1.5,
    fontFamily: 'LatoWeb',
    fontSize: '.9rem',
    color: theme.color.blueDTwhite,
    transition: `
      ${'color 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, '}
      ${'background-color 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms'}
    `,
    '&:hover, &:focus': {
      backgroundColor: theme.palette.primary.main,
      color: '#fff',
    },
  },
  button: {
    width: 26,
    padding: 0,
    '& svg': {
      fontSize: '28px',
    },
    '&[aria-expanded="true"] .kebob': {
      fill: theme.palette.primary.dark,
    },
  },
  actionSingleLink: {
    marginRight: theme.spacing(1),
    whiteSpace: 'nowrap',
    float: 'right',
    fontFamily: theme.font.bold,
  },
  menu: {
    maxWidth: theme.spacing(25),
  },
}));

export interface Props {
  createActions: (closeMenu: Function) => Action[];
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
  const [anchorEl, setAnchorEl] = React.useState<
    (EventTarget & HTMLElement) | undefined
  >(undefined);

  React.useEffect(() => {
    setActions(createActions(handleClose));
  }, [createActions]);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (props.toggleOpenCallback) {
      props.toggleOpenCallback();
    }
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(undefined);
  };

  const { ariaLabel, disabled } = props;

  if (typeof actions === 'undefined') {
    return null;
  }

  return (
    <div className={`${classes.root} action-menu ${props.className ?? ''}`}>
      <IconButton
        disabled={disabled}
        aria-owns={anchorEl ? 'action-menu' : undefined}
        aria-expanded={anchorEl ? true : undefined}
        aria-haspopup="true"
        onClick={handleClick}
        className={classes.button}
        data-qa-action-menu
        aria-label={ariaLabel}
      >
        <MoreHoriz type="primary" className="kebob" />
      </IconButton>
      <Menu
        id="action-menu"
        className={classes.menu}
        anchorEl={anchorEl}
        getContentAnchorEl={undefined}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        BackdropProps={{
          style: {
            backgroundColor: 'transparent',
          },
        }}
      >
        {(actions as Action[]).map((a, idx) => (
          <MenuItem
            key={idx}
            onClick={a.onClick}
            className={classes.item}
            data-qa-action-menu-item={a.title}
            disabled={a.disabled}
            tooltip={a.tooltip}
            isLoading={a.isLoading}
            aria-describedby={a.ariaDescribedBy}
            role="menuitem"
          >
            {a.title}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
};

export default ActionMenu;
