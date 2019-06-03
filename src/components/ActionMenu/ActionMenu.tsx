import MoreHoriz from '@material-ui/icons/MoreHoriz';
import * as React from 'react';
import IconButton from 'src/components/core/IconButton';
import Menu from 'src/components/core/Menu';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import MenuItem from 'src/components/MenuItem';

export interface Action {
  title: string;
  disabled?: boolean;
  tooltip?: string;
  isLoading?: boolean;
  onClick: (e: React.MouseEvent<HTMLElement>) => void;
}

type CSSClasses =
  | 'root'
  | 'item'
  | 'button'
  | 'actionSingleLink'
  | 'hidden'
  | 'menu';

const styles: StyleRulesCallback<CSSClasses> = theme => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end'
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
      color: '#fff'
    }
  },
  button: {
    width: 26,
    padding: 0,
    '& svg': {
      fontSize: '28px'
    },
    '&[aria-expanded="true"] .kebob': {
      fill: theme.palette.primary.dark
    }
  },
  actionSingleLink: {
    marginRight: theme.spacing(1),
    whiteSpace: 'nowrap',
    float: 'right',
    fontFamily: theme.font.bold
  },
  hidden: {
    height: 0,
    padding: 0
  },
  menu: {
    maxWidth: theme.spacing(25)
  }
});

interface Props {
  createActions: (closeMenu: Function) => Action[];
  toggleOpenCallback?: () => void;
}

interface State {
  actions?: Action[];
  anchorEl?: Linode.TodoAny;
}

type CombinedProps = Props & WithStyles<CSSClasses>;

export class ActionMenu extends React.Component<CombinedProps, State> {
  state = {
    actions: [],
    anchorEl: undefined
  };

  generateActions(createActions: Linode.TodoAny) {
    this.setState({
      actions: createActions(this.handleClose)
    });
  }

  componentDidMount() {
    const { createActions } = this.props;
    this.generateActions(createActions);
  }

  componentWillReceiveProps(nextProps: Props) {
    const { createActions } = nextProps;
    this.generateActions(createActions);
  }

  handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (this.props.toggleOpenCallback) {
      this.props.toggleOpenCallback();
    }
    this.setState({ anchorEl: event.currentTarget });
  };

  handleClose = () => {
    this.setState({ anchorEl: undefined });
  };

  render() {
    const { classes } = this.props;
    const { actions, anchorEl } = this.state;

    if (typeof actions === 'undefined') {
      return null;
    }

    return (
      <div className={`${classes.root} action-menu`}>
        <IconButton
          aria-owns={anchorEl ? 'action-menu' : undefined}
          aria-expanded={anchorEl ? true : undefined}
          aria-haspopup="true"
          onClick={this.handleClick}
          className={classes.button}
          data-qa-action-menu
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
          onClose={this.handleClose}
          BackdropProps={{
            style: {
              backgroundColor: 'transparent'
            },
            'data-qa-backdrop': true
          }}
        >
          <MenuItem key="placeholder" aria-hidden className={classes.hidden} />
          {(actions as Action[]).map((a, idx) => (
            <MenuItem
              key={idx}
              onClick={a.onClick}
              className={classes.item}
              data-qa-action-menu-item={a.title}
              disabled={a.disabled}
              tooltip={a.tooltip}
              isLoading={a.isLoading}
            >
              {a.title}
            </MenuItem>
          ))}
        </Menu>
      </div>
    );
  }
}

const styled = withStyles(styles);

export default styled(ActionMenu);
