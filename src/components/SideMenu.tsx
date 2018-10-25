import * as React from 'react';

import Drawer from '@material-ui/core/Drawer';
import Hidden from '@material-ui/core/Hidden';
import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';

import PrimaryNav from 'src/components/PrimaryNav';

type CSSClasses = 'menuPaper' | 'menuDocked';

const styles: StyleRulesCallback<CSSClasses> = (theme) => ({
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
  closeMenu: () => void;
  toggleTheme: () => void;
}

type CombinedProps = Props & WithStyles<CSSClasses>;

class SideMenu extends React.Component<CombinedProps> {
  render() {
    const { classes, open, closeMenu, toggleTheme } = this.props;

    return (
      <React.Fragment>
        <Hidden mdUp>
          <Drawer
            variant="temporary"
            open={open}
            classes={{ paper: classes.menuPaper }}
            onClose={closeMenu}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
          >
            <PrimaryNav closeMenu={closeMenu} toggleTheme={toggleTheme} />
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
            <PrimaryNav closeMenu={closeMenu} toggleTheme={toggleTheme} />
          </Drawer>
        </Hidden>
      </React.Fragment>
    );
  }
}

export default withStyles(styles, { withTheme: true })<Props>(SideMenu);
