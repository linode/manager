import * as React from 'react';
import { withStyles, StyleRulesCallback, Theme, WithStyles } from 'material-ui/styles';

import Button from 'material-ui/Button';
import Divider from 'material-ui/Divider';
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
  | 'reboot';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
  button: {
    background: 'white',
    border: `1px solid ${LinodeTheme.color.border3}`,
    transition: theme.transitions.create('border'),
    padding: '12px 16px 14px',
    '&:hover': {
      borderColor: LinodeTheme.color.border1,
    },
  },
  caret: {
    position: 'relative',
    top: 2,
    left: 2,
    marginLeft: theme.spacing.unit / 2,
    // color: theme.palette.text.primary,
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
  reboot: {

  },
});

interface Props {
  id: string | number;
  label: string;
  status: 'running' | 'offline' | string;
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
    const { id, label } = this.props;
    powerOnLinode(id, label);
  }

  powerOff = () => {
    const { id, label } = this.props;
    powerOffLinode(id, label);
    this.closeMenu();
  }

  reboot = () => {
    const { id, label } = this.props;
    rebootLinode(id, label);
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
          className={classes.button}
        >
          {isRunning &&
            <span>
              <PowerOn className={`${classes.icon} ${classes.powerOn}`} />
              Running
            </span>
          }
          {isOffline &&
            <span>
              <PowerOn className={`${classes.icon} ${classes.powerOff}`} />
              Offline
            </span>
          }
          {isBusy && 'Busy'}
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
            <Reload className={`${classes.icon} ${classes.reboot}`} />
            Power Reboot
          </MenuItem>
          <Divider />
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
