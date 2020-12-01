import * as React from 'react';
import Drawer from 'src/components/core/Drawer';
import Hidden from 'src/components/core/Hidden';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import PrimaryNav from 'src/components/PrimaryNav';
import { compose } from 'recompose';
import withFeatureFlagConsumer, {
  FeatureFlagConsumerProps
} from 'src/containers/withFeatureFlagConsumer.container';
import PrimaryNav_CMR from './PrimaryNav/PrimaryNav_CMR';

type ClassNames =
  | 'menuPaper'
  | 'menuPaperCMR'
  | 'menuDocked'
  | 'desktopMenu'
  | 'collapsedDesktopMenu';

const styles = (theme: Theme) =>
  createStyles({
    menuPaper: {
      height: '100%',
      width: theme.spacing(14) + 103, // 215
      backgroundColor: theme.bg.primaryNavPaper,
      borderRight: 'none',
      left: 'inherit',
      boxShadow: 'none',
      transition: 'width linear .1s',
      overflowX: 'hidden',
      [theme.breakpoints.up('xl')]: {
        width: theme.spacing(22) + 99 // 275
      }
    },
    menuPaperCMR: {
      height: '100%',
      width: 200,
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
      width: theme.spacing(7) + 36,
      '&:hover': {
        width: theme.spacing(9) + 150,
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
  toggleTheme: () => void;
  toggleSpacing: () => void;
}

type CombinedProps = Props & WithStyles<ClassNames> & FeatureFlagConsumerProps;

class SideMenu extends React.Component<CombinedProps> {
  render() {
    const {
      classes,
      open,
      desktopOpen,
      closeMenu,
      toggleSpacing,
      toggleTheme,
      flags
    } = this.props;

    const PrimaryNavComponent = flags.cmr ? PrimaryNav_CMR : PrimaryNav;

    return (
      <React.Fragment>
        <Hidden mdUp>
          <Drawer
            variant="temporary"
            open={open}
            classes={{
              paper: flags.cmr ? classes.menuPaperCMR : classes.menuPaper
            }}
            onClose={closeMenu}
            ModalProps={{
              keepMounted: true // Better open performance on mobile.
            }}
          >
            <PrimaryNavComponent
              closeMenu={closeMenu}
              toggleTheme={toggleTheme}
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
              paper: `${flags.cmr ? classes.menuPaperCMR : classes.menuPaper} ${
                desktopOpen ? classes.collapsedDesktopMenu : ''
              }`,
              docked: classes.menuDocked
            }}
            className={classes.desktopMenu}
          >
            <PrimaryNavComponent
              closeMenu={closeMenu}
              toggleTheme={toggleTheme}
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
