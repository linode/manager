import * as React from 'react';

import {
  withStyles,
  WithStyles,
  StyleRulesCallback,
  Theme,
} from 'material-ui';
import Button from 'material-ui/Button';
import Menu from 'material-ui/Menu';
import KeyboardArrowDown from 'material-ui-icons/KeyboardArrowDown';
import KeyboardArrowUp from 'material-ui-icons/KeyboardArrowUp';

import AddNewMenuItem, { MenuItem } from './AddNewMenuItem';

type CSSClasses = 'root' | 'button' | 'caret';

const styles: StyleRulesCallback = (theme: Theme & Linode.Theme) => ({
  root: {
    flex: 1,
  },
  button: {
    paddingRight: 22,
  },
  caret: {
    position: 'relative',
    top: 2,
    left: 2,
    marginLeft: theme.spacing.unit / 2,
  },
});

interface Props { }

interface State {
  anchorEl?: HTMLElement;
}

type PropsWithStyles = Props & WithStyles<CSSClasses>;

class AddNewMenu extends React.Component<PropsWithStyles, State> {
  state = {
    anchorEl: undefined,
  };

  items: MenuItem[] = [
    {
      title: 'Linode',
      onClick: (e) => {
        e.preventDefault();
      },
      body: `Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
    },
    {
      title: 'Volume',
      onClick: (e) => {
        e.preventDefault();
      },
      body: `Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
    },
    {
      title: 'NodeBalancer',
      onClick: (e) => {
        e.preventDefault();
      },
      body: `Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
    },
  ];

  handleClick = (event: React.MouseEvent<HTMLElement>) => {
    this.setState({ anchorEl: event.currentTarget });
  }

  handleClose = () => {
    this.setState({ anchorEl: undefined });
  }

  render() {
    const { anchorEl } = this.state;
    const { classes } = this.props;
    const itemsLen = this.items.length;

    return (
      <div className={classes.root}>
        <Button
          variant="raised"
          color="primary"
          aria-owns={anchorEl ? 'add-new-menu' : undefined}
          aria-haspopup="true"
          onClick={this.handleClick}
          className={classes.button}
        >
          Create {
            anchorEl
              ? <KeyboardArrowUp className={classes.caret}></KeyboardArrowUp>
              : <KeyboardArrowDown className={classes.caret}></KeyboardArrowDown>
          }
        </Button>
        <Menu
          id="add-new-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={this.handleClose}
          getContentAnchorEl={undefined}
          anchorOrigin={{ vertical: 50, horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          PaperProps={{ square: true }}
        >
          {this.items.map((i, idx) =>
            <AddNewMenuItem
              key={idx}
              index={idx}
              count={itemsLen}
              {...i}
            />)}
        </Menu>
      </div>

    );
  }
}

export default withStyles(styles, { withTheme: true })<Props>(AddNewMenu);
