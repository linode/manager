import * as React from 'react';

import Menu from '@material-ui/core/Menu';
import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUp from '@material-ui/icons/KeyboardArrowUp';

import PowerOn from 'src/assets/icons/powerOn.svg';
import Reload from 'src/assets/icons/reload.svg';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import MenuItem from 'src/components/MenuItem';
import { powerOffLinode, powerOnLinode, rebootLinode } from 'src/features/linodes/LinodesLanding/powerActions';
import { linodeInTransition } from 'src/features/linodes/transitions';

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

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
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

  openMenu = (e: React.MouseEvent<HTMLElement>) => {
    this._toggleMenu(e.currentTarget);
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
          onClick={this.openMenu}
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
              ? <KeyboardArrowUp className={classes.caret} />
              : <KeyboardArrowDown className={classes.caret} />
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
            onClick={this.toggleRebootDialog}
            className={classes.menuItem}
            data-qa-set-power="reboot"
          >
            <Reload className={`${classes.icon}`} />
            Reboot
          </MenuItem>
          {isRunning &&
            <MenuItem
              onClick={this.togglePowerDownDialog}
              className={classes.menuItem}
              data-qa-set-power="powerOff"
            >
              <PowerOn className={`${classes.icon} ${classes.powerOff}`} />
              Power Off
            </MenuItem>
          }
          {isOffline &&
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
          actions={this.renderActions}
          open={powerAlertOpen}
          onClose={this.closePowerAlert}
        >
          {bootOption === 'reboot'
            ? <Typography>Are you sure you want to reboot your Linode?</Typography>
            : <Typography>Are you sure you want to power down your Linode?</Typography>
          }
        </ConfirmationDialog>
      </React.Fragment>
    );
  }

  toggleRebootDialog = () => this.toggleDialog('reboot');

  togglePowerDownDialog = () => this.toggleDialog('power_down');

  closePowerAlert = () => this.setState({ powerAlertOpen: false });

  renderActions = () => {
    const { bootOption } = this.state;
    return (
      <ActionsPanel style={{ padding: 0 }}>
        <Button
          type="cancel"
          onClick={this.closePowerAlert}
          data-qa-cancel-cancel
        >
          Cancel
        </Button>
        <Button
          type="primary"
          onClick={this.rebootOrPowerLinode}
          data-qa-confirm-cancel
        >
          {(bootOption === 'reboot') ? 'Reboot' : 'Power Off'}
        </Button>
      </ActionsPanel>
    );
  };

}

const styled = withStyles(styles, { withTheme: true });

export default styled(LinodePowerButton);
