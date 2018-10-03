import * as React from 'react';

import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import MoreHoriz from '@material-ui/icons/MoreHoriz';

import MenuItem from 'src/components/MenuItem';

export interface Action {
  title: string;
  disabled?: boolean;
  tooltip?: string;
  onClick: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

type CSSClasses = 'root'
  | 'item'
  | 'button'
  | 'actionSingleLink'
  | 'hidden';

const styles: StyleRulesCallback<CSSClasses> = (theme) => ({
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
    height: 30,
    '& svg': {
      fontSize: '28px',
    },
    '&[aria-expanded="true"] .kebob': {
      fill: theme.palette.primary.dark,
    },
  },
  actionSingleLink: {
    marginRight: theme.spacing.unit,
    whiteSpace: 'nowrap',
    float: 'right',
    fontWeight: 700,
  },
  hidden: {
    height: 0,
    padding: 0,
  },
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
    if (this.props.toggleOpenCallback) { this.props.toggleOpenCallback() };
    this.setState({ anchorEl: event.currentTarget });
  }

  handleClose = () => {
    this.setState({ anchorEl: undefined });
  }

  render() {
    const { classes } = this.props;
    const { actions, anchorEl } = this.state;

    if (typeof actions === 'undefined') { return null; }

    return (
      <div className={classes.root}>
        <IconButton
          aria-owns={anchorEl ? 'action-menu' : undefined}
          aria-expanded={anchorEl ? true : undefined}
          aria-haspopup="true"
          onClick={this.handleClick}
          className={classes.button}
          data-qa-action-menu
        >
          <MoreHoriz color="primary" className="kebob" />
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
              disabled={a.disabled}
              tooltip={a.tooltip}
            >
              {a.title}
            </MenuItem>,
          )}
        </Menu>
      </div >
    );
  }
}

export default withStyles(styles, { withTheme: true })<Props>(ActionMenu);
