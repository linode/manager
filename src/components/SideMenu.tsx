import * as React from 'react';

import {
  withStyles,
  WithStyles,
  Theme,
  StyleRulesCallback,
} from 'material-ui/styles';
import LinodeTheme from 'src/theme';
import Hidden from 'material-ui/Hidden';
import Drawer from 'material-ui/Drawer';

import PrimaryNav from 'src/components/PrimaryNav';

type CSSClasses = 'menuPaper' | 'menuDocked';

const styles: StyleRulesCallback<CSSClasses> = (theme: Theme & Linode.Theme) => ({
  menuPaper: {
    height: '100%',
    width: 215,
    backgroundColor: LinodeTheme.bg.navy,
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
}

type CombinedProps = Props & WithStyles<CSSClasses>;

class SideMenu extends React.Component<CombinedProps> {
  render() {
    const { classes, open, toggle } = this.props;

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
            <PrimaryNav toggleMenu={toggle} />
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
            <PrimaryNav toggleMenu={toggle} />
          </Drawer>
        </Hidden>
      </React.Fragment>
    );
  }
}

export default withStyles(styles, { withTheme: true })<Props>(SideMenu);
