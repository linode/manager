import React, { Component, PropTypes } from 'react';

import { Dropdown } from 'linode-components/dropdowns';

import { showModal } from '~/actions/modal';
import { linodes as apiLinodes } from '~/api';
import { actions } from '~/api/configs/linodes';
import { powerOnLinode, powerOffLinode, rebootLinode } from '~/api/linodes';
import Polling from '~/api/polling';
import { LinodeStates, LinodeStatesReadable } from '~/constants';
import ConfigSelectModalBody from '~/linodes/components/ConfigSelectModalBody';
import { launchWeblishConsole } from '~/linodes/components/WeblishLaunch';


const RANDOM_PROGRESS_MAX = 75;
const RANDOM_PROGRESS_MIN = 40;

function randomInitialProgress() {
  return Math.random() * (RANDOM_PROGRESS_MAX - RANDOM_PROGRESS_MIN) + RANDOM_PROGRESS_MIN;
}

export default class StatusDropdown extends Component {
  constructor() {
    super();
    this.open = this.open.bind(this);
    this.close = this.close.bind(this);

    this._polling = Polling({
      apiRequestFn: this.fetchLinode.bind(this),
      timeout: 2500,
      maxTries: 20,
      onMaxTriesReached: this.onMaxPollingReached.bind(this),
    });
    this.state = {
      open: false,
    };
  }

  componentDidMount() {
    const { linode } = this.props;
    if (linode.status === 'provisioning') {
      this.startLinodePolling('provisioning');
    }
  }

  componentWillUpdate(nextProps) {
    const { linode } = nextProps;

    // stop polling if Linode status change is complete
    if (LinodeStates.pending.indexOf(linode.status) === -1) {
      this._polling.stop(linode.id);
    }
  }

  onMaxPollingReached() {
    // TODO: error state
  }

  async startLinodePolling(tempStatus = '') {
    const { dispatch, linode } = this.props;

    await dispatch(actions.one({ status: tempStatus, __progress: 1 }, linode.id));
    dispatch(actions.one({ __progress: randomInitialProgress() }, linode.id));

    this._polling.start(linode.id);
  }

  fetchLinode() {
    const { dispatch, linode } = this.props;

    dispatch(apiLinodes.one([linode.id]));
  }

  open() {
    this.setState({ open: !this.state.open });
  }

  close() {
    this.setState({ open: false });
  }

  render() {
    const { linode, dispatch, className } = this.props;

    if (LinodeStates.pending.indexOf(linode.status) !== -1) {
      const safeProgress = linode.__progress || RANDOM_PROGRESS_MAX;
      return (
        <div className={`StatusDropdown ${className}`}>
          <div className="StatusDropdown-container">
            <div
              style={{ width: `${safeProgress}%` }}
              className="StatusDropdown-progress"
            >
              <div className="StatusDropdown-percent">{Math.round(safeProgress)}%</div>
            </div>
          </div>
        </div>
      );
    }

    const status = LinodeStatesReadable[linode.status];
    const elements = [
      {
        name: 'Reboot',
        tempStatus: 'rebooting',
        _key: 'reboot',
        _action: rebootLinode,
        _condition: () => linode.status === 'running',
        _configs: true,
      },
      {
        name: 'Power Off',
        tempStatus: 'shutting_down',
        _key: 'power-off',
        _action: powerOffLinode,
        _condition: () => linode.status === 'running',
      },
      {
        name: 'Power On',
        tempStatus: 'booting',
        _key: 'power-on',
        _action: powerOnLinode,
        _condition: () => linode.status === 'offline',
        _configs: true,
      },
      {
        name: 'Launch Console',
        _key: 'text-console',
        _action: () => { launchWeblishConsole(linode); },
        _condition: () => linode.status === 'running',
      },
    ]
    .filter(element => element._condition())
    .map(element => ({
      ...element,
      action: () => {
        this.close();

        const configCount = Object.keys(linode._configs.configs).length;
        if (!element._configs || configCount <= 1) {
          dispatch(element._action(linode.id));
          this.startLinodePolling(element.tempStatus);
          return;
        }

        dispatch(showModal('Select Configuration Profile',
          <ConfigSelectModalBody
            linode={linode}
            dispatch={dispatch}
            action={element._action}
          />
        ));
      },
    }));

    return (
      <div className="StatusDropdown StatusDropdown--dropdown">
        <Dropdown elements={[{ name: status }, ...elements]} dropdownIcon="fa-cog" />
      </div>
    );
  }
}

StatusDropdown.propTypes = {
  className: PropTypes.string,
  linode: PropTypes.object,
  dispatch: PropTypes.func,
};
