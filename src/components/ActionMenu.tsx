import * as React from 'react';

import {
  withStyles, WithStyles, StyleRulesCallback, Theme,
} from 'material-ui';
import Button from 'material-ui/Button';
import Menu, { MenuItem } from 'material-ui/Menu';
import MoreHoriz from 'material-ui-icons/MoreHoriz';

export interface Action {
  title: string;
  onClick: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

type CSSClasses = 'item';

const styles: StyleRulesCallback<CSSClasses> = (theme: Theme) => ({
  item: {
    paddingLeft: theme.spacing.unit * 2,
    paddingRight: theme.spacing.unit * 2,
    paddingTop: theme.spacing.unit,
    paddingBottom: theme.spacing.unit,
  },
});

interface Props {
  actions: Action[];
}

interface State {
  anchorEl?: Linode.TodoAny;
}

type PropsWithStyles = Props & WithStyles<CSSClasses>;

class ActionMenu extends React.Component<PropsWithStyles, State> {
  state = { anchorEl: undefined };

  handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    this.setState({ anchorEl: event.currentTarget });
  }

  handleClose = () => {
    this.setState({ anchorEl: undefined });
  }

  render() {
    const { actions, classes } = this.props;
    const { anchorEl } = this.state;

    return actions.length === 1
      ? actions.map((a, idx) => <a href="#" key={idx} onClick={e => a.onClick(e)}>{a.title}</a>)
      : (<div>
        <Button
          aria-owns={anchorEl ? 'action-menu' : undefined}
          aria-haspopup="true"
          onClick={this.handleClick}
        >
          <MoreHoriz color="primary" />
        </Button >
        <Menu
          id="action-menu"
          anchorEl={anchorEl}
          getContentAnchorEl={undefined}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          open={Boolean(anchorEl)}
          onClose={this.handleClose}
        >
          {actions.map((a, idx) =>
            <MenuItem
              key={idx}
              onClick={a.onClick}
              className={classes.item}
            >{a.title}</MenuItem>,
          )}
        </Menu>
      </div >);
  }
}

export default withStyles(styles, { withTheme: true })(ActionMenu);
