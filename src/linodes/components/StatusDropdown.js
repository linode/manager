import React, { Component, PropTypes } from 'react';

import { linodes as apiLinodes } from '~/api';
import { actions } from '~/api/configs/linodes';
import { powerOnLinode, powerOffLinode, rebootLinode } from '~/api/linodes';
import Polling from '~/api/polling';
import { LinodeStates, LinodeStatesReadable } from '~/constants';
import { showModal } from '~/actions/modal';
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
    const { linode, dispatch, shortcuts, className } = this.props;
    const dropdownElements = [
      {
        name: <span>Reboot</span>,
        tempStatus: 'rebooting',
        _key: 'reboot',
        _action: rebootLinode,
        _condition: () => linode.status !== 'offline',
        _configs: true,
      },
      {
        name: <span>Power off</span>,
        tempStatus: 'shutting_down',
        _key: 'power-off',
        _action: powerOffLinode,
        _condition: () => linode.status === 'running',
      },
      {
        name: <span>Power on</span>,
        tempStatus: 'booting',
        _key: 'power-on',
        _action: powerOnLinode,
        _condition: () => linode.status === 'offline',
        _configs: true,
      },
      {
        name: <span>Launch Console</span>,
        _key: 'text-console',
        _action: () => { launchWeblishConsole(linode); },
        _condition: () => shortcuts,
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

        dispatch(showModal('Select configuration profile',
          <ConfigSelectModalBody
            linode={linode}
            dispatch={dispatch}
            action={element._action}
          />
        ));
      },
    }));

    const dropdownMenu = dropdownElements.map(({ name, action, _key }) =>
      <button
        type="button"
        key={_key}
        className="StatusDropdown-item"
        onMouseDown={action}
      >{name}</button>
    );
    const openClass = this.state.open ? 'StatusDropdown--open' : '';

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

    return (
      <div
        className={`StatusDropdown ${openClass} ${className}`}
        onBlur={this.close}
      >
        <button
          type="button"
          className="StatusDropdown-toggle"
          data-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded={this.state.open}
          onClick={this.open}
          disabled={LinodeStates.pending.indexOf(linode.status) !== -1}
        >
          {LinodeStatesReadable[linode.status] || 'Offline'} <i className="fa fa-caret-down" />
        </button>
        <div className="StatusDropdown-menu">{dropdownMenu}</div>
      </div>
    );
  }
}

StatusDropdown.propTypes = {
  className: PropTypes.string,
  linode: PropTypes.object,
  dispatch: PropTypes.func,
  shortcuts: PropTypes.bool,
  short: PropTypes.bool,
};

StatusDropdown.defaultProps = {
  shortcuts: true,
  short: true,
};
