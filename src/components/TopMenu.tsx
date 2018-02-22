import * as React from 'react';

import {
  withStyles,
  StyledComponentProps,
} from 'material-ui/styles';
import AppBar from 'material-ui/AppBar';
import Typography from 'material-ui/Typography';
import Toolbar from 'material-ui/Toolbar';
import IconButton from 'material-ui/IconButton';

import MenuIcon from 'material-ui-icons/Menu';

import { menuWidth } from 'src/components/SideMenu';
import { TodoAny } from 'src/utils';

const styles = (theme: any): any => ({
  appBar: {
    backgroundColor: '#333',
    position: 'absolute',
    marginLeft: menuWidth,
    [theme.breakpoints.up('md')]: {
      width: `calc(100% - ${menuWidth}px)`,
    },
  },
  navIconHide: {
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
});

type Props = StyledComponentProps & {
  toggleSideMenu: () => void, 
};

class TopMenu extends React.Component<Props> {
  render() {
    const { classes, toggleSideMenu } = this.props;

    if (!classes) {
      return null;
    }

    return (
      <AppBar className={classes.appBar}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open menu"
            onClick={toggleSideMenu}
            className={classes.navIconHide}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="title" color="inherit" noWrap>
            Linode Manager
          </Typography>
        </Toolbar>
      </AppBar>
    );
  }
}

export default withStyles(styles, { withTheme: true })(
  TopMenu as TodoAny,
) as TodoAny;
