import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { setError } from '~/actions/errors';
import { getLinode } from './IndexPage';
import { showModal, hideModal } from '~/actions/modal';
import { linodes } from '~/api';
import { resetPassword, rescueLinode } from '~/api/linodes';
import { ConfirmModalBody } from '~/components/modals';
import { Form, FormGroup, SubmitButton, PasswordInput } from '~/components/form';
import HelpButton from '~/components/HelpButton';
import { setSource } from '~/actions/source';
import { getConfig,
  getDisks,
  getDiskSlots,
  renderDiskSlot,
  fillDiskSlots,
  addDiskSlot,
  removeDiskSlot,
  AVAILABLE_DISK_SLOTS,
} from '~/linodes/linode/settings/layouts/EditConfigPage.js';


export class RescuePage extends Component {
  static async preload({ dispatch, getState }, { linodeLabel }) {
    const { id } = Object.values(getState().api.linodes.linodes).reduce(
      (match, linode) => linode.label === linodeLabel ? linode : match);

    try {
      await dispatch(linodes.disks.all([id]));
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      dispatch(setError(e));
    }
  }

  constructor(props) {
    super(props);
    this.getLinode = getLinode.bind(this);
    this.getConfig = getConfig.bind(this);
    this.getDisks = getDisks.bind(this);
    this.getDiskSlots = getDiskSlots.bind(this);
    this.fillDiskSlots = fillDiskSlots.bind(this);
    this.rebootToRescue = this.rebootToRescue.bind(this);
    this.removeDiskSlot = removeDiskSlot.bind(this);
    this.addDiskSlot = addDiskSlot.bind(this);
    this.renderDiskSlot = renderDiskSlot.bind(this);
    this.renderDiskSlotNoEdit = this.renderDiskSlotNoEdit.bind(this);
    this.renderRescueMode = this.renderRescueMode.bind(this);
    this.resetRootPassword = this.resetRootPassword.bind(this);
    this.renderResetRootPassword = this.renderResetRootPassword.bind(this);
    this.state = {
      password: '',
      disk: null,
      applying: false,
      result: null,
    };
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
    const linode = this.getLinode();
    const diskSlots = await this.getDiskSlots(false);
    const disk = Object.values(linode._disks.disks)
                       .filter(d => d.filesystem !== 'swap')[0];
    this.setState({
      diskSlots,
      disk: disk ? disk.id : null,
    });
  }

  async resetRootPassword() {
    const { password, disk } = this.state;
    const { dispatch } = this.props;
    const linode = this.getLinode();

    try {
      this.setState({ applying: true, result: null });
      await dispatch(resetPassword(linode.id, disk, password));

      this.setState({
        applying: false,
        result: <span className="text-success">Success!</span>,
      });
    } catch (response) {
      this.setState({
        applying: false,
        result: <span className="text-danger">An error occured.</span>,
      });
    }
  }

  async rebootToRescue() {
    const { diskSlots } = this.state;
    const { dispatch } = this.props;
    const linode = this.getLinode();
    const disks = {};

    if (diskSlots) {
      diskSlots.forEach((slotId, i) => {
        disks[AVAILABLE_DISK_SLOTS[i]] = slotId;
      });
      await dispatch(rescueLinode(linode.id, { disks }));
    }
  }

  renderDiskSlotNoEdit(device, index) {
    const disks = this.getDisks();

    return (
      <FormGroup
        className="row disk-slot"
        key={index}
      >
        <label className="col-sm-2 row-label">
          /dev/{AVAILABLE_DISK_SLOTS[index]}
        </label>
        <div className="col-sm-10">
          {disks[device].label}
        </div>
      </FormGroup>
    );
  }


  renderRescueMode() {
    const { diskSlots } = this.state;
    const linode = this.getLinode();

    const showDisks = linode && linode._disks ? Object.values(linode._disks.disks).filter(
      d => d.filesystem !== 'swap').length > 1 : false;

    let slots = null;
    if (showDisks && diskSlots) {
      slots = diskSlots.map(this.renderDiskSlot);
    } else if (diskSlots) {
      slots = diskSlots.map(this.renderDiskSlotNoEdit);
    }
    return (
      <div className="col-sm-6">
        <section className="card">
          <header>
            <h2>
              Rescue mode
              <HelpButton to="http://example.org" />
            </h2>
            <p></p>
          </header>
          <Form className="RescueMode-form" onSubmit={() => { this.rebootToRescue(); }}>
            {slots}
            <div className="form-group row disk-slot">
              <label className="col-sm-2 row-label">
                /dev/sdh
              </label>
              <div className="col-sm-10">Finnix Media</div>
            </div>
            <div className="form-group row">
              <div className="col-sm-2"></div>
              <div className="col-sm-10">
                <SubmitButton>Reboot</SubmitButton>
              </div>
            </div>
          </Form>
        </section>
      </div>
    );
  }

  renderResetRootPassword() {
    const { disk } = this.state;
    const { dispatch } = this.props;
    const linode = this.getLinode();

    let body = (
      <p>This Linode does not have any disks eligible for password reset.</p>
    );

    if (disk) {
      const showDisks = Object.values(linode._disks.disks).reduce(
        (showDisks, d) => showDisks || d.filesystem !== 'swap', false);

      body = (
        <div className="root-pw">
          {linode.status === 'offline' ? null :
            <div className="alert alert-info">Your Linode must
              be powered off to reset your root password.
            </div>}
            {showDisks ?
              <div className="form-group row">
                <label
                  htmlFor="reset-root-password-select"
                  className="col-sm-2 col-form-label"
                >
                  Disk:
                </label>
                <div className="col-sm-10">
                  <select
                    name="reset-root-password-select"
                    value={disk}
                    className="form-control"
                    onChange={e => this.setState({ disk: e.target.value })}
                  >
                    {Object.values(linode._disks.disks)
                      .filter(d => d.filesystem !== 'swap')
                      .map(d => <option value={d.id} key={d.id}>{d.label}</option>)}
                  </select>
                </div>
              </div>
            : null}
          <div className="form-group row">
              {showDisks ?
                <label htmlFor="password" className="col-sm-2 col-form-label">Password:</label>
              : null}
            <div className="col-sm-10">
              <PasswordInput
                onChange={password => this.setState({ password })}
              />
            </div>
          </div>
          <div className="form-group row">
            <div className="col-sm-2"></div>
            <div className="col-sm-10">
              <SubmitButton
                disabled={!this.state.password || this.state.applying ||
                          linode.status !== 'offline'}
              >Reset Password</SubmitButton>
              <span style={{ marginLeft: '0.5rem' }}>
                {this.state.result}
              </span>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="col-sm-6">
        <section className="card">
          <Form
            className="ResetRootPassword-form"
            onSubmit={() => {
              dispatch(showModal('Reset root password', <ConfirmModalBody
                buttonText="Reset Password"
                children="Are you sure you want to reset the root password for this Linode?
                This cannot be undone."
                onCancel={() => dispatch(hideModal())}
                onOk={() => {
                  dispatch(hideModal());
                  this.resetRootPassword();
                }}
              />));
            }}
          >
            <header>
              <h2>
                Reset root password
                <HelpButton to="http://example.org" />
              </h2>
            </header>
            {body}
          </Form>
        </section>
      </div>
    );
  }

  render() {
    return (
      <div className="row-justify">
        {this.renderRescueMode()}
        {this.renderResetRootPassword()}
      </div>
    );
  }
}

RescuePage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  params: PropTypes.shape({
    linodeLabel: PropTypes.string,
  }),
};

function select(state) {
  return { linodes: state.api.linodes };
}

export default connect(select)(RescuePage);
