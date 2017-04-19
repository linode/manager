import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { setError } from '~/actions/errors';
import { selectLinode } from '../utilities';
import { showModal, hideModal } from '~/actions/modal';
import { linodes } from '~/api';
import { resetPassword, rescueLinode } from '~/api/linodes';
import { ConfirmModalBody } from 'linode-components/modals';
import { Form, FormGroup, SubmitButton, Select, PasswordInput } from 'linode-components/forms';
import { Card, CardHeader } from 'linode-components/cards';
import { setSource } from '~/actions/source';
import {
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
    const { dispatch, linode } = this.props;
    dispatch(setSource(__filename));
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
    const { dispatch, linode } = this.props;

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
    const { dispatch, linode } = this.props;

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
    const { linode } = this.props;
    const { diskSlots } = this.state;

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
        <Card
          header={<CardHeader title="Rescue mode" helpLink="http://example.org" />}
        >
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
        </Card>
      </div>
    );
  }

  renderResetRootPassword() {
    const { disk } = this.state;
    const { dispatch, linode } = this.props;

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
                  <Select
                    name="reset-root-password-select"
                    value={disk}
                    onChange={e => this.setState({ disk: e.target.value })}
                  >
                    {Object.values(linode._disks.disks)
                      .filter(d => d.filesystem !== 'swap')
                      .map(d => <option value={d.id} key={d.id}>{d.label}</option>)}
                  </Select>
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
              <SubmitButton disabled={this.state.applying || linode.status !== 'offline'}>
                Reset Password
              </SubmitButton>
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
        <Card
          header={
            <CardHeader title="Reset root password" helpLink="http://example.org" />
          }
        >
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
            {body}
          </Form>
        </Card>
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
  linode: PropTypes.object.isRequired,
};

export default connect(selectLinode)(RescuePage);
