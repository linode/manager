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
import linodeIcon from 'src/assets/addnewmenu/linode.svg';
import volumeIcon from 'src/assets/addnewmenu/volume.svg';
import nodebalancerIcon from 'src/assets/addnewmenu/nodebalancer.svg';


type CSSClasses = 'root' | 'menu' | 'button' | 'caret';

const styles: StyleRulesCallback = (theme: Theme & Linode.Theme) => ({
  root: {
    flex: 1,
  },
  menu: {
    // padding: 0,
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
      body: `High performance SSD Linux servers for all of your infrastructure needs`,
      icon: linodeIcon,
    },
    {
      title: 'Volume',
      onClick: (e) => {
        e.preventDefault();
      },
      body: `Block storage service allows you to attach additional storage to your Linode`,
      icon: volumeIcon,
    },
    {
      title: 'NodeBalancer',
      onClick: (e) => {
        e.preventDefault();
      },
      body: `Ensure your valuable applications and services are highly-available`,
      icon: nodebalancerIcon,
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
          PaperProps={{ square: true }}
          anchorOrigin={{ vertical: 65, horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          MenuListProps={{ className: classes.menu }}
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
