import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUp from '@material-ui/icons/KeyboardArrowUp';
import * as classNames from 'classnames';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Menu from 'src/components/core/Menu';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import EntityIcon from 'src/components/EntityIcon';
import MenuItem from 'src/components/MenuItem';
import {
  powerOffLinode,
  powerOnLinode,
  rebootLinode
} from 'src/features/linodes/LinodesLanding/powerActions';
import { linodeInTransition } from 'src/features/linodes/transitions';

type ClassNames =
  | 'root'
  | 'button'
  | 'buttonText'
  | 'caret'
  | 'caretDisabled'
  | 'menuItem'
  | 'menuItemInner'
  | 'buttonInner'
  | 'hidden';

const styles = (theme: Theme) =>
  createStyles({
    '@keyframes fadeIn': {
      from: {
        opacity: 0
      },
      to: {
        opacity: 1
      }
    },
    root: {
      '& svg': {
        transition: theme.transitions.create(['color'])
      }
    },
    button: {
      position: 'relative',
      transition: theme.transitions.create(['color', 'border-color']),
      minWidth: 145,
      padding: `${theme.spacing(1) - 2}px ${theme.spacing(1)}px`,
      '&:hover': {
        textDecoration: 'underline'
      },
      '&:hover, &.active': {
        borderColor: theme.palette.primary.light,
        backgroundColor: 'transparent'
      }
    },
    buttonText: {
      marginLeft: theme.spacing(1)
    },
    caret: {
      color: theme.palette.primary.main,
      transition: theme.transitions.create(['color']),
      position: 'relative',
      top: 2,
      left: 2,
      marginLeft: theme.spacing(1) / 2
    },
    caretDisabled: {
      color: theme.color.disabledText
    },
    menuItem: {
      color: theme.palette.primary.main,
      padding: theme.spacing(2),
      outline: 0,
      borderBottom: `1px solid ${theme.palette.divider}`,
      '&:not(.hasTooltip)': {
        '&:hover, &:focus': {
          '& $buttonText': {
            color: 'white'
          },
          '& svg': {
            fill: '#FFF'
          },
          '& .insidePath *, ': {
            stroke: '#fff'
          },
          '& svg:not(.loading) .outerCircle': {
            stroke: '#fff'
          }
        }
      }
    },
    menuItemInner: {
      display: 'flex',
      alignItems: 'center'
    },
    buttonInner: {
      display: 'flex',
      animation: '$fadeIn .2s ease-in-out',
      alignItems: 'center'
    },
    hidden: {
      ...theme.visually.hidden
    }
  });

interface Props {
  id: number;
  label: string;
  status: Linode.LinodeStatus;
  noConfigs: boolean;
  disabled?: boolean;
  recentEvent?: Linode.Event;
  openConfigDrawer: (
    config: Linode.Config[],
    action: (id: number) => void
  ) => void;
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
      anchorEl: undefined
    },
    bootOption: null,
    powerAlertOpen: false
  };

  _toggleMenu = (value?: HTMLElement) =>
    this.setState({ menu: { anchorEl: value } });

  openMenu = (e: React.MouseEvent<HTMLElement>) => {
    this._toggleMenu(e.currentTarget);
  };

  closeMenu = () => {
    this._toggleMenu();
  };

  powerOn = () => {
    const { id, label, openConfigDrawer } = this.props;
    powerOnLinode(openConfigDrawer, id, label);
    this.closeMenu();
  };

  toggleDialog = (bootOption: Linode.BootAction) => {
    this.setState({
      powerAlertOpen: !this.state.powerAlertOpen,
      bootOption
    });
    this.closeMenu();
  };

  rebootOrPowerLinode = () => {
    const { bootOption } = this.state;
    const { id, label, openConfigDrawer } = this.props;
    if (bootOption === 'reboot') {
      rebootLinode(openConfigDrawer, id, label);
    } else {
      powerOffLinode(id, label);
    }
    this.setState({ powerAlertOpen: false });
  };

  render() {
    const { status, classes, disabled, recentEvent, noConfigs } = this.props;
    const {
      menu: { anchorEl },
      bootOption,
      powerAlertOpen
    } = this.state;

    const isBusy = linodeInTransition(status, recentEvent);
    const isRunning = !isBusy && status === 'running';
    const isOffline = !isBusy && status === 'offline';
    const buttonText = () => {
      if (isBusy) {
        return 'Busy';
      } else if (isRunning) {
        return 'Running';
      } else if (isOffline) {
        return 'Offline';
      } else {
        return 'Offline';
      }
    };
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
          <div className={classes.buttonInner}>
            <EntityIcon
              variant="linode"
              status={status}
              loading={isBusy}
              size={34}
              marginTop={1}
            />
            <span className={classes.buttonText}>{buttonText()}</span>
          </div>
          {anchorEl ? (
            <KeyboardArrowUp
              className={classNames({
                [classes.caret]: true,
                [classes.caretDisabled]: isBusy
              })}
            />
          ) : (
            <KeyboardArrowDown
              className={classNames({
                [classes.caret]: true,
                [classes.caretDisabled]: isBusy
              })}
            />
          )}
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
          <MenuItem key="placeholder" aria-hidden className={classes.hidden} />
          {isRunning && (
            <MenuItem
              onClick={this.toggleRebootDialog}
              className={classes.menuItem}
              data-qa-set-power="reboot"
              disabled={disabled}
            >
              <div className={classes.menuItemInner}>
                <EntityIcon
                  variant="linode"
                  loading={true}
                  size={26}
                  marginTop={2}
                  stopAnimation
                />
                <span className={classes.buttonText}>Reboot</span>
              </div>
            </MenuItem>
          )}
          {isRunning && (
            <MenuItem
              onClick={this.togglePowerDownDialog}
              className={classes.menuItem}
              data-qa-set-power="powerOff"
              disabled={disabled}
            >
              <div className={classes.menuItemInner}>
                <EntityIcon
                  variant="linode"
                  status="offline"
                  size={26}
                  marginTop={2}
                  stopAnimation
                />
                <span className={classes.buttonText}>Power Off</span>
              </div>
            </MenuItem>
          )}
          {isOffline && (
            <MenuItem
              onClick={this.powerOn}
              className={classes.menuItem}
              data-qa-set-power="powerOn"
              disabled={noConfigs || disabled}
              tooltip={
                noConfigs
                  ? 'A config needs to be added before powering on a Linode'
                  : undefined
              }
            >
              <div className={classes.menuItemInner}>
                <EntityIcon
                  variant="linode"
                  status="running"
                  size={26}
                  marginTop={2}
                  stopAnimation
                />
                <span className={classes.buttonText}>Power On</span>
              </div>
            </MenuItem>
          )}
        </Menu>
        <ConfirmationDialog
          title={bootOption === 'reboot' ? 'Confirm Reboot' : 'Powering Off'}
          actions={this.renderActions}
          open={powerAlertOpen}
          onClose={this.closePowerAlert}
        >
          {bootOption === 'reboot' ? (
            <Typography>
              Are you sure you want to reboot your Linode?
            </Typography>
          ) : (
            <Typography>
              Are you sure you want to power down your Linode?
            </Typography>
          )}
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
          buttonType="cancel"
          onClick={this.closePowerAlert}
          data-qa-cancel-cancel
        >
          Cancel
        </Button>
        <Button
          buttonType="primary"
          onClick={this.rebootOrPowerLinode}
          data-qa-confirm-cancel
        >
          {bootOption === 'reboot' ? 'Reboot' : 'Power Off'}
        </Button>
      </ActionsPanel>
    );
  };
}

const styled = withStyles(styles);

export default styled(LinodePowerButton);
