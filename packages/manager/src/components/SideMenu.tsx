import * as React from 'react';
import Drawer from 'src/components/core/Drawer';
import Hidden from 'src/components/core/Hidden';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import { compose } from 'recompose';
import withFeatureFlagConsumer, {
  FeatureFlagConsumerProps
} from 'src/containers/withFeatureFlagConsumer.container';
import PrimaryNav from './PrimaryNav/PrimaryNav_CMR';

type ClassNames =
  | 'menuPaper'
  | 'menuDocked'
  | 'desktopMenu'
  | 'collapsedDesktopMenu';

const styles = (theme: Theme) =>
  createStyles({
    menuPaper: {
      height: '100%',
      width: 190,
      backgroundColor: theme.bg.primaryNavPaper,
      borderRight: 'none',
      left: 'inherit',
      boxShadow: 'none',
      transition: 'width linear .1s',
      overflowX: 'hidden'
    },
    menuDocked: {
      height: '100%'
    },
    desktopMenu: {
      transform: 'none'
    },
    collapsedDesktopMenu: {
      width: 60,
      '&:hover': {
        width: 190,
        '& .logoLetters, & .primaryNavLink': {
          opacity: 1
        }
      }
    }
  });

interface Props {
  open: boolean;
  desktopOpen: boolean;
  closeMenu: () => void;
  toggleSpacing: () => void;
}

type CombinedProps = Props & WithStyles<ClassNames> & FeatureFlagConsumerProps;

class SideMenu extends React.Component<CombinedProps> {
  render() {
    const { classes, open, desktopOpen, closeMenu, toggleSpacing } = this.props;

    return (
      <React.Fragment>
        <Hidden mdUp>
          <Drawer
            variant="temporary"
            open={open}
            classes={{
              paper: classes.menuPaper
            }}
            onClose={closeMenu}
            ModalProps={{
              keepMounted: true // Better open performance on mobile.
            }}
          >
            <PrimaryNav
              closeMenu={closeMenu}
              toggleSpacing={toggleSpacing}
              isCollapsed={false}
            />
          </Drawer>
        </Hidden>
        <Hidden smDown implementation="css">
          <Drawer
            variant="permanent"
            open
            classes={{
              paper: `${classes.menuPaper} ${desktopOpen &&
                classes.collapsedDesktopMenu}`,
              docked: classes.menuDocked
            }}
            className={classes.desktopMenu}
          >
            <PrimaryNav
              closeMenu={closeMenu}
              toggleSpacing={toggleSpacing}
              isCollapsed={desktopOpen}
            />
          </Drawer>
        </Hidden>
      </React.Fragment>
    );
  }
}

const enhanced = compose<CombinedProps, Props>(
  withStyles(styles),
  withFeatureFlagConsumer
);

export default enhanced(SideMenu);
