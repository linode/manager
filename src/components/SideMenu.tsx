import * as React from 'react';
import Drawer from 'src/components/core/Drawer';
import Hidden from 'src/components/core/Hidden';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import PrimaryNav from 'src/components/PrimaryNav';

type ClassNames = 'menuPaper' | 'menuDocked';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  menuPaper: {
    height: '100%',
    width: theme.spacing.unit * 14 + 103, // 215
    backgroundColor: theme.bg.navy,
    left: 'inherit',
    boxShadow: 'none',
    [theme.breakpoints.up('xl')]: {
      width: theme.spacing.unit * 22 + 99 // 275
    }
  },
  menuDocked: {
    height: '100%'
  }
});

interface Props {
  open: boolean;
  closeMenu: () => void;
  toggleTheme: () => void;
  toggleSpacing: () => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class SideMenu extends React.Component<CombinedProps> {
  render() {
    const { classes, open, closeMenu, toggleSpacing, toggleTheme } = this.props;

    return (
      <React.Fragment>
        <Hidden mdUp>
          <Drawer
            variant="temporary"
            open={open}
            classes={{ paper: classes.menuPaper }}
            onClose={closeMenu}
            ModalProps={{
              keepMounted: true // Better open performance on mobile.
            }}
          >
            <PrimaryNav
              closeMenu={closeMenu}
              toggleTheme={toggleTheme}
              toggleSpacing={toggleSpacing}
            />
          </Drawer>
        </Hidden>
        <Hidden smDown implementation="css">
          <Drawer
            variant="permanent"
            open
            classes={{
              paper: classes.menuPaper,
              docked: classes.menuDocked
            }}
          >
            <PrimaryNav
              closeMenu={closeMenu}
              toggleTheme={toggleTheme}
              toggleSpacing={toggleSpacing}
            />
          </Drawer>
        </Hidden>
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles);

export default styled(SideMenu);
