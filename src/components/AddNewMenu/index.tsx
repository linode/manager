import * as React from 'react';

import {
  withStyles,
  WithStyles,
  StyleRulesCallback,
  Theme,
} from 'material-ui';
import Button from 'material-ui/Button';
import Menu from 'material-ui/Menu';

import AddNewMenuItem, { MenuItem } from './AddNewMenuItem';

type CSSClasses = 'button' | 'caret';

const styles: StyleRulesCallback = (theme: Theme & Linode.Theme) => ({
  button: {
    textTransform: 'unset',
    borderRadius: '4px',
  },
  caret: {
    marginLeft: theme.spacing.unit,
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
      <div>
        <Button
          variant="raised"
          color="primary"
          aria-owns={anchorEl ? 'add-new-menu' : undefined}
          aria-haspopup="true"
          onClick={this.handleClick}
          className={classes.button}
        >
          Add New {
            anchorEl
              ? <span className={classes.caret}>&#9660;</span>
              : <span className={classes.caret}>&#9650;</span>
          }
        </Button>
        <Menu
          id="add-new-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={this.handleClose}
          getContentAnchorEl={undefined}
          anchorOrigin={{ vertical: 40, horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
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
