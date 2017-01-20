import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { getLinode } from './IndexPage';
import { showModal, hideModal } from '~/actions/modal';
import { linodes } from '~/api';
import { resetPassword, rebootLinode } from '~/api/linodes';
import { ConfirmModalBody } from '~/components/modals';
import { Card } from '~/components';
import { Form, FormGroup, PasswordInput, SubmitButton } from '~/components/form';
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
    await dispatch(linodes.disks.all([id]));
  }

  constructor(props) {
    super(props);
    this.getLinode = getLinode.bind(this);
    this.getConfig = getConfig.bind(this);
    this.getDisks = getDisks.bind(this);
    this.getDiskSlots = getDiskSlots.bind(this);
    this.fillDiskSlots = fillDiskSlots.bind(this);
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

  renderDiskSlotNoEdit(device, index) {
    const disks = this.getDisks();

    return (
      <div
        className="form-group row disk-slot"
        key={index}
      >
        <label className="col-sm-2 label-col">
          /dev/{AVAILABLE_DISK_SLOTS[index]}
        </label>
        <div className="col-xs-9 input-container">
          {disks[device].label}
        </div>
      </div>
    );
  }


  renderRescueMode() {
    const { diskSlots } = this.state;
    const { dispatch } = this.props;
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
        <Card title="Rescue mode">
          {slots}
          <div className="form-group row disk-slot">
            <label className="col-sm-2 label-col">
              /dev/sdh
            </label>
            <div className="col-xs-9 input-container">Finnix Media</div>
          </div>
          <div className="form-group row">
            <div className="col-sm-2"></div>
            <div className="col-xs-9">
              <button
                className="btn btn-default"
                onClick={() => dispatch(rebootLinode)}
                disabled
              >Reboot</button>
            </div>
          </div>
        </Card>
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

      let diskField = null;
      if (showDisks && linode._disks.disks.length > 1) {
        diskField = (
          <select
            id="reset-root-password-select"
            name="reset-root-password-select"
            value={disk}
            className="form-control"
            onChange={e => this.setState({ disk: e.target.value })}
          >
            {Object.values(linode._disks.disks)
              .filter(d => d.filesystem !== 'swap')
              .map(d => <option value={d.id} key={d.id}>{d.label}</option>)}
          </select>
        );
      } else if (showDisks) {
        diskField = (
          <span className="StaticFormField">
            <input type="hidden"
                   id="reset-root-password-select"
                   name="reset-root-password-select"
                   value={disk} />
            {linode._disks.disks[disk].label}
          </span>
        )
      }

      body = (
        <div className="root-pw">
          {linode.status === 'offline' ? null :
            <div className="alert alert-info">Your Linode must
              be powered off to reset your root password.
            </div>}
          {showDisks ?
            <FormGroup className="row">
              <div className="label-col col-sm-2">
                <label htmlFor="reset-root-password-select">Disk:</label>
              </div>
              <div className="input-container col-sm-9">
                {diskField}
              </div>
            </FormGroup>
            : null}
          <FormGroup className="row">
            {showDisks ?
              <div className="label-col col-sm-2">
                <label htmlFor="password">Password:</label>
              </div>
              : null}
            <div className="col-sm-10">
              <PasswordInput
                passwordType="offline_fast_hashing_1e10_per_second"
                onChange={password => this.setState({ password })}
              />
            </div>
          </FormGroup>
          <FormGroup className="row">
            <div className="offset-sm-2 col-sm-10">
              <SubmitButton
                disabled={!this.state.password || this.state.applying ||
                linode.status !== 'offline'}
              >Reset Password</SubmitButton>
              <span style={{ marginLeft: '0.5rem' }}>
                {this.state.result}
              </span>
            </div>
          </FormGroup>
        </div>
      );
    }

    return (
      <div className="col-sm-6">
        <Card title="Reset root password">
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
  params: PropTypes.shape({
    linodeLabel: PropTypes.string,
  }),
};

function select(state) {
  return { linodes: state.api.linodes };
}

export default connect(select)(RescuePage);
