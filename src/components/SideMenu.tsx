import * as React from 'react';

import { withStyles, WithStyles, Theme, StyleRulesCallback } from '@material-ui/core/styles';
import Hidden from '@material-ui/core/Hidden';
import Drawer from '@material-ui/core/Drawer';

import PrimaryNav from 'src/components/PrimaryNav';

type CSSClasses = 'menuPaper' | 'menuDocked';

const styles: StyleRulesCallback<CSSClasses> = (theme: Theme & Linode.Theme) => ({
  menuPaper: {
    height: '100%',
    width: 215,
    backgroundColor: theme.bg.navy,
    left: 'inherit',
    boxShadow: 'none',
    [theme.breakpoints.up('xl')]: {
      width: 275,
    },
  },
  menuDocked: {
    height: '100%',
  },
});

interface Props {
  open: boolean;
  toggle: () => void;
  toggleTheme: () => void;
}

type CombinedProps = Props & WithStyles<CSSClasses>;

class SideMenu extends React.Component<CombinedProps> {
  render() {
    const { classes, open, toggle, toggleTheme } = this.props;

    return (
      <React.Fragment>
        <Hidden mdUp>
          <Drawer
            variant="temporary"
            open={open}
            classes={{ paper: classes.menuPaper }}
            onClose={toggle}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
          >
            <PrimaryNav toggleMenu={toggle} toggleTheme={toggleTheme} />
          </Drawer>
        </Hidden>
        <Hidden smDown implementation="css">
          <Drawer
            variant="permanent"
            open
            classes={{
              paper: classes.menuPaper,
              docked: classes.menuDocked,
            }}
          >
            <PrimaryNav toggleMenu={toggle} toggleTheme={toggleTheme} />
          </Drawer>
        </Hidden>
      </React.Fragment>
    );
  }
}

export default withStyles(styles, { withTheme: true })<Props>(SideMenu);
