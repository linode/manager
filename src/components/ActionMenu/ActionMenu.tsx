import * as React from 'react';

import {
  withStyles, WithStyles, StyleRulesCallback, Theme,
} from 'material-ui';
import IconButton from 'material-ui/IconButton';
import Menu, { MenuItem } from 'material-ui/Menu';
import MoreHoriz from 'material-ui-icons/MoreHoriz';

export interface Action {
  title: string;
  onClick: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

type CSSClasses = 'root'
  | 'item'
  | 'button'
  | 'hidden';

const styles: StyleRulesCallback<CSSClasses> = (theme: Theme & Linode.Theme) => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  item: {
    paddingLeft: theme.spacing.unit * 2,
    paddingRight: theme.spacing.unit * 2,
    paddingTop: theme.spacing.unit * 1.5,
    paddingBottom: theme.spacing.unit * 1.5,
    fontWeight: 400,
    fontSize: '.9rem',
    color: theme.palette.primary.main,
    transition: `${'color 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, '}
    ${'background-color 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms'}`,
    '&:hover, &:focus': {
      backgroundColor: theme.palette.primary.main,
      color: 'white',
    },
  },
  button: {
    height: 30,
    '& svg': {
      fontSize: '28px',
    },
  },
  hidden: {
    height: 0,
    padding: 0,
  },
});

interface Props {
  createActions: (closeMenu: Function) => Action[];
}

interface State {
  actions?: Action[];
  anchorEl?: Linode.TodoAny;
}

type CombinedProps = Props & WithStyles<CSSClasses>;

class ActionMenu extends React.Component<CombinedProps, State> {
  state = {
    actions: [],
    anchorEl: undefined,
  };

  generateActions(createActions: Linode.TodoAny) {
    this.setState({
      actions: createActions(this.handleClose),
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
    this.setState({ anchorEl: event.currentTarget });
  }

  handleClose = () => {
    this.setState({ anchorEl: undefined });
  }

  render() {
    const { classes } = this.props;
    const { actions, anchorEl } = this.state;

    if (typeof actions === 'undefined') { return null; }

    return actions.length === 1
      ? (actions as Action[]).map((a, idx) =>
          <a href="#" key={idx} onClick={e => a.onClick(e)}>{a.title}</a>)
      : (<div className={classes.root}>
        <IconButton
          aria-owns={anchorEl ? 'action-menu' : undefined}
          aria-haspopup="true"
          onClick={this.handleClick}
          className={classes.button}
          data-qa-action-menu
        >
          <MoreHoriz color="primary" />
        </IconButton >
        <Menu
          id="action-menu"
          anchorEl={anchorEl}
          getContentAnchorEl={undefined}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          open={Boolean(anchorEl)}
          onClose={this.handleClose}
        >
          <MenuItem key="placeholder" className={classes.hidden} />
          {(actions as Action[]).map((a, idx) =>
            <MenuItem
              key={idx}
              onClick={a.onClick}
              className={classes.item}
              data-qa-action-menu-item={a.title}
            >{a.title}</MenuItem>,
          )}
        </Menu>
      </div >);
  }
}

export default withStyles(styles, { withTheme: true })<Props>(ActionMenu);
