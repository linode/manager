import React, { Component, PropTypes } from 'react';

import { Dropdown } from 'linode-components/dropdowns';
import { ConfirmModalBody, DeleteModalBody } from 'linode-components/modals';

import { hideModal, showModal } from '~/actions/modal';
import { linodes as apiLinodes } from '~/api';
import { actions } from '~/api/configs/linodes';
import { powerOnLinode, powerOffLinode, rebootLinode } from '~/api/linodes';
import Polling from '~/api/polling';
import { LinodeStates, LinodeStatesReadable } from '~/constants';
import ConfigSelectModalBody from '~/linodes/components/ConfigSelectModalBody';
import { launchWeblishConsole } from '~/linodes/components/WeblishLaunch';


const RANDOM_PROGRESS_MAX = 20;
const RANDOM_PROGRESS_MIN = 5;

function randomInitialProgress() {
  return Math.random() * (RANDOM_PROGRESS_MAX - RANDOM_PROGRESS_MIN) + RANDOM_PROGRESS_MIN;
}

const POLLING = Polling({
  apiRequestFn: fetchLinode,
  timeout: 2500,
  maxTries: 20,
  onMaxTriesReached: onMaxPollingReached,
});

function fetchLinode(id) {
  return async (dispatch, getState) => {
    const linode = getState().api.linodes.linodes[id];
    await dispatch(apiLinodes.one([id]));

    // Increment progress with max of 95%.
    const newProgress = Math.min(linode.__progress ? linode.__progress + 10 : 1, 95);
    dispatch(setProgress(linode, newProgress));
  }
}

function onMaxPollingReached() {
  // TODO: error state
}

function setProgress(linode, progress) {
  return (dispatch) => {
    const safeProgress = linode.__progress || 0;
    const progressIncreasingOrZero = progress === 0 ? 0 : Math.max(safeProgress, progress);

    const isPending = LinodeStates.pending.indexOf(linode.status) !== -1;

    return dispatch(actions.one({ __progress: progressIncreasingOrZero }, linode.id));
  };
}

export default class StatusDropdown extends Component {
  constructor() {
    super();
    this.open = this.open.bind(this);
    this.close = this.close.bind(this);

    this.state = {
      open: false,
      hiddenClass: '',
    };
  }

  componentDidMount() {
    const { linode, dispatch } = this.props;

    const isPending = LinodeStates.pending.indexOf(linode.status) !== -1;
    const isPolling = POLLING.isPolling(linode.id);

    if (isPending && !isPolling) {
      this.startLinodePolling();
    }
  }

  componentWillUpdate(nextProps) {
    const { linode, dispatch } = nextProps;

    const isPending = LinodeStates.pending.indexOf(linode.status) !== -1;
    const isPolling = POLLING.isPolling(linode.id);
    const inEndingState = [undefined, 0, 100].indexOf(linode.__progress) === -1;

    if (isPending && !isPolling) {
      this.startLinodePolling();
    } else if (!isPending && (isPolling || inEndingState)) {
      POLLING.stop(linode.id);
      dispatch(setProgress(linode, 100));

      setTimeout(() => {
        // Reset it back to zero after giving it time to fade away without animating back to 0.
        this.setState({ hiddenClass: 'hidden' });

        setTimeout(() => {
          dispatch(setProgress(linode, 0));
          this.setState({ hiddenClass: '' });
        }, 100);
      }, 1200); // A little bit longer than the width transition time.
    }
  }

  startLinodePolling() {
    const { linode, dispatch } = this.props;

    dispatch(setProgress(linode, 1));
    dispatch(POLLING.start(linode.id));

    // The point of this is to give time for bar to animate from beginning.
    // Important for this to happen last otherwise we end up in an infinite loop.
    setTimeout(() => dispatch(setProgress(linode, randomInitialProgress())), 100);
  }

  open() {
    this.setState({ open: !this.state.open });
  }

  close() {
    this.setState({ open: false });
  }

  render() {
    const { linode, dispatch } = this.props;

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
        _condition: () => true,
      },
      {
        name: 'Delete',
        _key: 'delete',
        _condition: () => true,
      },
    ]
    .filter(element => element._condition())
    .map(element => ({
      ...element,
      action: () => {
        this.close();

        if (element._key === 'delete') {
          dispatch(showModal('Delete Linode', (
            <DeleteModalBody
              onOk={() => {
                dispatch(apiLinodes.delete(linode.id));
                dispatch(hideModal());
              }}
              items={[linode.label]}
              onCancel={() => dispatch(hideModal())}
            />
          )));
          return;
        }

        const callback = () => {
          const configCount = Object.keys(linode._configs.configs).length;
          if (!element._configs || configCount <= 1) {
            dispatch(element._action(linode.id));
            dispatch(hideModal());
            return;
          }

          dispatch(showModal('Select Configuration Profile', (
            <ConfigSelectModalBody
              linode={linode}
              dispatch={dispatch}
              action={element._action}
            />
          )));
        };

        const noConfirmActions = ['power-on', 'text-console'];
        if (noConfirmActions.indexOf(element._key) !== -1) {
          // No need to confirm this action.
          callback();
        } else {
          dispatch(showModal(`Confirm ${element.name}`, (
            <ConfirmModalBody
              onCancel={() => dispatch(hideModal())}
              onOk={callback}
            >
              Are you sure you want to {element.name.toLowerCase()} <strong>{linode.label}</strong>?
            </ConfirmModalBody>
          )));
        }
      },
    }));

    return (
      <div className="StatusDropdown StatusDropdown--dropdown">
        <Dropdown elements={[{ name: status }, ...elements]} dropdownIcon="fa-cog" />
        <div className="StatusDropdown-container">
          {/* The calc(x + 1px) is needed because we have left: -1px on this element. */}
          <div
            style={{ width: `calc(${linode.__progress}%${linode.__progress === 0 ? '' : ' + 1px'})` }}
            className={`StatusDropdown-progress ${this.state.hiddenClass}`}
          />
        </div>
      </div>
    );
  }
}

StatusDropdown.propTypes = {
  linode: PropTypes.object,
  dispatch: PropTypes.func,
};
