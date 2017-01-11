import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { ErrorSummary, reduceErrors, FormGroup, FormGroupError } from '~/errors';
import { getLinode } from './IndexPage';
import { showModal, hideModal } from '~/actions/modal';
import { linodes } from '~/api';
import { resetPassword, rebootLinode } from '~/api/linodes';
import { ConfirmModalBody } from '~/components/modals';
import { Form, SubmitButton } from '~/components/form';
import Select from '~/components/Select';
import PasswordInput from '~/components/PasswordInput';
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
      errors: {},
      loading: false,
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

    this.setState({ errors: {}, loading: true });

    try {
      await dispatch(resetPassword(linode.id, disk, password));
    } catch (response) {
      const errors = await reduceErrors(response);
      this.setState({ errors });
    }

    this.setState({ loading: false });
  }

  renderDiskSlotNoEdit(device, index) {
    const disks = this.getDisks();

    return (
      <div className="form-group row" key={index}>
        <div className="col-sm-2 label-col">
          <label>/dev/{AVAILABLE_DISK_SLOTS[index]}</label>
        </div>
        <div className="col-sm-10">
          <div className="input-line-height">
            {disks[device].label}
          </div>
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
        <section className="card">
          <header>
            <h2>
              Rescue mode
              <HelpButton to="http://example.org" />
            </h2>
            <p></p>
          </header>
          {slots}
          <div className="form-group row">
            <div className="col-sm-2 label-col">
              <label>/dev/sdh</label>
            </div>
            <div className="col-sm-10 content-col">
              <div className="input-line-height">
                Finnix Media
              </div>
            </div>
          </div>
          <div className="form-group row">
            <div className="col-sm-2"></div>
            <div className="col-sm-10">
              <button
                className="btn btn-default"
                onClick={() => dispatch(rebootLinode)}
                disabled
              >Reboot</button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  renderResetRootPassword() {
    const { disk, errors } = this.state;
    const { dispatch } = this.props;
    const linode = this.getLinode();

    let body = (
      <p>This Linode does not have any disks eligible for password reset.</p>
    );

    if (disk) {
      const multipleNonSwapDisks = Object.values(linode._disks.disks).reduce(
        (nonSwapDisks, d) => d.filesystem === 'swap' ? nonSwapDisks : nonSwapDisks + 1, -1);

      body = (
        <div className="root-pw">
          {linode.status === 'offline' ? null :
            <div className="alert alert-info">Your Linode must
              be powered off to reset your root password.
            </div>}
            {multipleNonSwapDisks ?
              <FormGroup className="row" field="disk" errors={errors}>
                <div className="col-sm-3 label-col">
                  <label htmlFor="reset-root-password-select">Disk:</label>
                </div>
                <div className="col-sm-9">
                  <Select
                    value={disk}
                    onChange={e => this.setState({ disk: e.target.value })}
                  >
                    {Object.values(linode._disks.disks)
                      .filter(d => d.filesystem !== 'swap')
                      .map(d => <option value={d.id} key={d.id}>{d.label}</option>)}
                  </Select>
                </div>
              </FormGroup>
             : null}
          <FormGroup className="row" field="root_pass" errors={errors}>
            <div className="col-sm-3 label-col">
              <label htmlFor="password">Password:</label>
            </div>
            <div className="col-sm-9">
              <PasswordInput
                passwordType="offline_fast_hashing_1e10_per_second"
                onChange={password => this.setState({ password })}
              />
              <FormGroupError errors={errors} field="root_pass" />
            </div>
          </FormGroup>
          <div className="row">
            <div className="col-sm-9 offset-sm-3">
              <SubmitButton
                disabled={linode.status !== 'offline' || this.loading}
              >Reset Password</SubmitButton>
            </div>
          </div>
          <ErrorSummary errors={this.state.errors} />
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
