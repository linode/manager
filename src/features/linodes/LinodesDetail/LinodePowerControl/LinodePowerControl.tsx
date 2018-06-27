import * as React from 'react';
import { withStyles, StyleRulesCallback, Theme, WithStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import { KeyboardArrowDown, KeyboardArrowUp } from '@material-ui/icons';

import { powerOffLinode, powerOnLinode, rebootLinode }
  from 'src/features/linodes/LinodesLanding/powerActions';
import ActionsPanel from 'src/components/ActionsPanel';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import MenuItem from 'src/components/MenuItem';
import { linodeInTransition } from 'src/features/linodes/transitions';

import PowerOn from 'src/assets/icons/powerOn.svg';
import Reload from 'src/assets/icons/reload.svg';

type ClassNames = 'root'
  | 'button'
  | 'caret'
  | 'menuItem'
  | 'icon'
  | 'powerOn'
  | 'powerOff'
  | 'rotate'
  | 'fadeIn'
  | 'hidden';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme & Linode.Theme) => ({
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
  root: {
    '& svg': {
      transition: theme.transitions.create(['color']),
    },
  },
  button: {
    backgroundColor: theme.color.white,
    transition: theme.transitions.create(['background-color', 'color', 'border-color']),
    border: `1px solid ${theme.color.border1}`,
    padding: '12px 16px 13px',
    minWidth: 145,
    '&:hover, &.active': {
      borderColor: theme.palette.primary.main,
      backgroundColor: theme.palette.primary.main,
      color: 'white',
      '& svg': {
        color: 'white',
      },
    },
  },
  caret: {
    transition: theme.transitions.create(['color']),
    position: 'relative',
    top: 2,
    left: 2,
    marginLeft: theme.spacing.unit / 2,
  },
  menuItem: {
    color: theme.palette.primary.main,
    padding: theme.spacing.unit * 2,
    outline: 0,
    borderBottom: `1px solid ${theme.palette.divider}`,
    '&:hover, &:focus': {
      '& svg': {
        color: 'white',
      },
    },
  },
  icon: {
    marginRight: theme.spacing.unit + 2,
  },
  powerOn: {
    color: theme.color.green,
  },
  powerOff: {
    color: theme.color.red,
  },
  rotate: {
    animation: 'rotate 2s linear infinite',
    color: theme.palette.text.primary,
  },
  fadeIn: {
    animation: 'fadeIn .2s ease-in-out',
  },
  hidden: {
    height: 0,
    padding: 0,
  },
});

interface Props {
  id: number;
  label: string;
  status: Linode.LinodeStatus;
  recentEvent?: Linode.Event;
  openConfigDrawer: (config: Linode.Config[], action: (id: number) => void) => void;
}

interface State {
  menu: {
    anchorEl?: HTMLElement;
  };
  bootOption: Linode.BootAction;
  powerAlertOpen: boolean;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export class LinodePowerButton extends React.Component<CombinedProps, State> {
  state = {
    menu: {
      anchorEl: undefined,
    },
    bootOption: null,
    powerAlertOpen: false,
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

  toggleDialog = (bootOption: Linode.BootAction) => {
    this.setState({
      powerAlertOpen: !this.state.powerAlertOpen,
      bootOption,
    });
    this.closeMenu();
  }

  rebootOrPowerLinode = () => {
    const { bootOption } = this.state;
    const { id, label, openConfigDrawer } = this.props;
    if (bootOption === 'reboot') {
      rebootLinode(openConfigDrawer, id, label);
    } else {
      powerOffLinode(id, label);
    }
    this.setState({ powerAlertOpen: false });
  }

  render() {
    const { status, classes, recentEvent } = this.props;
    const { menu: { anchorEl }, bootOption, powerAlertOpen } = this.state;

    const isBusy = linodeInTransition(status, recentEvent);
    const isRunning = !isBusy && status === 'running';
    const isOffline = !isBusy && status === 'offline';

    return (
      <React.Fragment>
        <Button
          disabled={isBusy}
          onClick={e => this.openMenu(e.currentTarget)}
          aria-owns={anchorEl ? 'power' : undefined}
          aria-haspopup="true"
          className={`${classes.button} ${anchorEl ? 'active' : ''}`}
          data-qa-power-control={status}
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
        >
          <MenuItem key="placeholder" className={classes.hidden} />
          <MenuItem
            onClick={() => this.toggleDialog('reboot')}
            className={classes.menuItem}
            data-qa-set-power="reboot"
          >
            <Reload className={`${classes.icon}`} />
            Reboot
          </MenuItem>
          { isRunning &&
            <MenuItem
              onClick={() => this.toggleDialog('power_down')}
              className={classes.menuItem}
              data-qa-set-power="powerOff"
            >
              <PowerOn className={`${classes.icon} ${classes.powerOff}`} />
              Power Off
            </MenuItem>
          }
          { isOffline &&
            <MenuItem
              onClick={this.powerOn}
              className={classes.menuItem}
              data-qa-set-power="powerOn"
            >
              <PowerOn className={`${classes.icon} ${classes.powerOn}`} />
              Power On
            </MenuItem>
          }
        </Menu>
        <ConfirmationDialog
          title={(bootOption === 'reboot') ? 'Confirm Reboot' : 'Powering Off'}
          actions={() =>
            <ActionsPanel style={{ padding: 0 }}>
              <Button
                variant="raised"
                color="secondary"
                className="destructive"
                onClick={this.rebootOrPowerLinode}
                data-qa-confirm-cancel
              >
                {(bootOption === 'reboot')
                  ? 'Reboot'
                  : 'Power Off'}
              </Button>
              <Button
                onClick={() => this.setState({ powerAlertOpen: false })}
                variant="raised"
                color="secondary"
                className="cancel"
                data-qa-cancel-cancel
              >
                Cancel
            </Button>
            </ActionsPanel>
          }
          open={powerAlertOpen}
        >
          {bootOption === 'reboot'
            ? 'Are you sure you want to reboot your Linode'
            : 'Are you sure you want to power down your Linode'}
        </ConfirmationDialog>
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(LinodePowerButton);
