import * as React from 'react';
import { withStyles, StyleRulesCallback, Theme, WithStyles } from 'material-ui/styles';

import Button from 'material-ui/Button';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/Menu/MenuItem';
import KeyboardArrowDown from 'material-ui-icons/KeyboardArrowDown';
import KeyboardArrowUp from 'material-ui-icons/KeyboardArrowUp';

import {
  powerOffLinode,
  powerOnLinode,
  rebootLinode,
} from 'src/features/linodes/LinodesLanding/powerActions';

import LinodeTheme from 'src/theme';
import PowerOn from '../../../../assets/icons/powerOn.svg';
import Reload from '../../../../assets/icons/reload.svg';

type ClassNames = 'root'
  | 'button'
  | 'caret'
  | 'popOver'
  | 'menuItem'
  | 'icon'
  | 'powerOn'
  | 'powerOff'
  | 'rotate'
  | 'fadeIn';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  '@keyframes fadeIn': {
    from: {
      opacity: 0,
    },
    to: {
      opacity: 1,
    },
  },
  '@keyframes rotate': {
    from: {
      transform: 'rotate(0deg)',
    },
    to: {
      transform: 'rotate(360deg)',
    },
  },
  root: {},
  button: {
    background: 'white',
    border: `1px solid ${LinodeTheme.color.border3}`,
    transition: theme.transitions.create('border'),
    padding: '12px 16px 13px',
    minWidth: 145,
    '&:hover, &.active': {
      borderColor: LinodeTheme.color.border1,
    },
  },
  caret: {
    position: 'relative',
    top: 2,
    left: 2,
    marginLeft: theme.spacing.unit / 2,
  },
  popOver: {
    position: 'absolute',
    outline: 0,
    boxShadow: '0 0 5px #ddd',
    overflowY: 'auto',
    overflowX: 'hidden',
    minHeight: 16,
    minWidth: 250,
  },
  menuItem: {
    color: theme.palette.primary.main,
    padding: theme.spacing.unit * 2,
    outline: 0,
    borderBottom: `1px solid ${theme.palette.divider}`,
    '&:hover, &:focus': {
      backgroundColor: LinodeTheme.bg.offWhite,
    },
  },
  icon: {
    marginRight: theme.spacing.unit + 2,
  },
  powerOn: {
    color: LinodeTheme.color.green,
  },
  powerOff: {
    color: LinodeTheme.color.red,
  },
  rotate: {
    animation: 'rotate 2s linear infinite',
    color: theme.palette.text.primary,
  },
  fadeIn: {
    animation: 'fadeIn .2s ease-in-out',
  },
});

interface Props {
  id: number;
  label: string;
  status: 'running' | 'offline' | string;
  openConfigDrawer: (config: Linode.Config[], action: (id: number) => void) => void;
}

interface State {
  menu: {
    anchorEl?: HTMLElement;
  };
}

type CombinedProps = Props & WithStyles<ClassNames>;

class LinodePowerButton extends React.Component<CombinedProps, State> {
  state = {
    menu: {
      anchorEl: undefined,
    },
  };

  _toggleMenu = (value?: HTMLElement) => this.setState({ menu: { anchorEl: value } });

  openMenu = (element: HTMLElement) => {
    this._toggleMenu(element);
  }

  closeMenu = () => {
    this._toggleMenu();
  }

  powerOn = () => {
    const { id, label, openConfigDrawer } = this.props;
    powerOnLinode(openConfigDrawer, id, label);
    this.closeMenu();
  }

  powerOff = () => {
    const { id, label } = this.props;
    powerOffLinode(id, label);
    this.closeMenu();
  }

  reboot = () => {
    const { id, label, openConfigDrawer } = this.props;
    rebootLinode(openConfigDrawer, id, label);
    this.closeMenu();
  }

  render() {
    const { status, classes } = this.props;
    const { menu: { anchorEl } } = this.state;

    const isRunning = status === 'running';
    const isOffline = status === 'offline';
    const isBusy = !isRunning && !isOffline;

    return (
      <React.Fragment>
        <Button
          disabled={!['running', 'offline'].includes(status)}
          onClick={e => this.openMenu(e.currentTarget)}
          aria-owns={anchorEl ? 'power' : undefined}
          aria-haspopup="true"
          className={`${classes.button} ${anchorEl ? 'active' : ''}`}
        >
          {isRunning &&
            <span className={classes.fadeIn}>
              <PowerOn className={`${classes.icon} ${classes.powerOn}`} />
              Running
            </span>
          }
          {isOffline &&
            <span className={classes.fadeIn}>
              <PowerOn className={`${classes.icon} ${classes.powerOff}`} />
              Offline
            </span>
          }
          {isBusy &&
            <span className={classes.fadeIn}>
              <Reload className={`${classes.icon} ${classes.rotate}`} />
              Busy
            </span>
          }
          {
            anchorEl
              ? <KeyboardArrowUp className={classes.caret}></KeyboardArrowUp>
              : <KeyboardArrowDown className={classes.caret}></KeyboardArrowDown>
          }
        </Button>
        <Menu
          id="power"
          open={Boolean(anchorEl)}
          getContentAnchorEl={undefined}
          onClose={this.closeMenu}
          anchorEl={anchorEl}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: -10, horizontal: 'right' }}
          PaperProps={{ className: classes.popOver }}
        >
          <MenuItem
            onClick={this.reboot}
            className={classes.menuItem}
          >
            <Reload className={`${classes.icon}`} />
            Reboot
          </MenuItem>
          { isRunning &&
            <MenuItem
              onClick={this.powerOff}
              className={classes.menuItem}
            >
              <PowerOn className={`${classes.icon} ${classes.powerOff}`} />
              Power Off
            </MenuItem>
          }
          { isOffline &&
            <MenuItem
              onClick={this.powerOn}
              className={classes.menuItem}
            >
              <PowerOn className={`${classes.icon} ${classes.powerOn}`} />
              Power On
            </MenuItem>
          }
        </Menu>
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(LinodePowerButton);
