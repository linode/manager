import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUp from '@material-ui/icons/KeyboardArrowUp';
import * as classNames from 'classnames';
import * as React from 'react';
import Button from 'src/components/Button';
import Menu from 'src/components/core/Menu';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import EntityIcon from 'src/components/EntityIcon';
import MenuItem from 'src/components/MenuItem';
import { linodeInTransition } from 'src/features/linodes/transitions';

import PowerDialogOrDrawer, { Action } from '../../PowerActionsDialogOrDrawer';

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
  disabled?: boolean;
  linodeEvents?: Linode.Event[];
  linodeConfigs: Linode.Config[];
}

interface State {
  menu: {
    anchorEl?: HTMLElement;
  };
  selectedBootAction?: Action;
  powerDialogOpen: boolean;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export class LinodePowerButton extends React.Component<CombinedProps, State> {
  state: State = {
    menu: {
      anchorEl: undefined
    },
    powerDialogOpen: false
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
    // const { id, label } = this.props;
    this.closeMenu();
  };

  openDialog = (bootOption: Action) => {
    this.setState({
      powerDialogOpen: true,
      selectedBootAction: bootOption
    });
    this.closeMenu();
  };

  closeDialog = () => {
    this.setState({ powerDialogOpen: false });
  };

  render() {
    const {
      status,
      classes,
      disabled,
      linodeEvents,
      linodeConfigs
    } = this.props;
    const {
      menu: { anchorEl }
    } = this.state;

    const hasNoConfigs = linodeConfigs.length === 0;

    const firstEventWithPercent = (linodeEvents || []).find(
      eachEvent => typeof eachEvent.percent_complete === 'number'
    );

    const isBusy = linodeInTransition(status, firstEventWithPercent);
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
              onClick={() => this.openDialog('Reboot')}
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
              onClick={() => this.openDialog('Power Off')}
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
              onClick={() => this.openDialog('Power On')}
              className={classes.menuItem}
              data-qa-set-power="powerOn"
              disabled={hasNoConfigs || disabled}
              tooltip={
                hasNoConfigs
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
        <PowerDialogOrDrawer
          isOpen={this.state.powerDialogOpen}
          action={this.state.selectedBootAction}
          linodeID={this.props.id}
          linodeLabel={this.props.label}
          close={this.closeDialog}
          linodeConfigs={this.props.linodeConfigs}
        />
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles);

export default styled(LinodePowerButton);
