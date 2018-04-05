import * as React from 'react';
import { withStyles, StyleRulesCallback, Theme, WithStyles } from 'material-ui/styles';

import Button from 'material-ui/Button';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/Menu/MenuItem';

import {
  powerOffLinode,
  powerOnLinode,
  rebootLinode,
} from 'src/features/linodes/LinodesLanding/powerActions';
type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
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
  }

  reboot = () => {
    const { id, label } = this.props;
    rebootLinode(id, label);
  }

  render() {
    const { status } = this.props;
    const { menu: { anchorEl } } = this.state;

    const isRunning = status === 'running';
    const isOffline = status === 'offline';
    const isBusy = !isRunning && !isOffline;

    return (
      <React.Fragment>
        <Button
          disabled={!['running', 'offline'].includes(status)}
          onClick={e => this.openMenu(e.currentTarget)}
        >
          {isRunning && 'running'}
          {isOffline && 'offline'}
          {isBusy && 'busy'}
        </Button>
        <Menu open={Boolean(anchorEl)} onClose={this.closeMenu} anchorEl={anchorEl}>
          { isRunning && <MenuItem onClick={this.powerOn}>Power On</MenuItem> }
          { isOffline && <MenuItem onClick={this.powerOff}>Power Off</MenuItem> }
          <MenuItem onClick={this.reboot}>Power Reboot</MenuItem>
        </Menu>
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(LinodePowerButton);

/**
 * Button
 *  - needs current status
 *    - When status is 'running' title displays "Running" with the green indicator.
 *    - When status is 'offline', title displays "Offline" with the red indicator.
 *    - When status is anything else, title displays "Busy", with busy indicator and is disabled.
 *
 * Menu
 *  - Always has "reboot" option.
 *  - Has option "Power On" when status is "offline"
 *  - Has option "Power Off" when status is "running"
 */
