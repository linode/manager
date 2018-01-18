import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { ExternalLink } from 'linode-components';
import { ConfirmModalBody } from 'linode-components';
import { showModal } from '~/actions/modal';
import { kvmifyLinode } from '~/api/ad-hoc/linodes';
import { dispatchOrStoreErrors } from '~/api/util';


export default class UpgradeToKVM extends Component {
  static title = 'Upgrade to KVM';
  static trigger(dispatch, linode, type) {
    return dispatch(showModal(UpgradeToKVM.title, (
      <UpgradeToKVM
        dispatch={dispatch}
        linode={linode}
        type={type}
      />
    )));
  }

  constructor(props) {
    super(props);

    this.state = { errors: {} };
  }

  render() {
    const { dispatch, linode, type, close } = this.props;
    const { errors } = this.state;
    const migrateEst = Math.round(type.disk / (4000 / 60) / 60);

    return (
      <ConfirmModalBody
        onSubmit={() => dispatch(dispatchOrStoreErrors.call(this, [
          () => kvmifyLinode(linode.id),
          close,
        ]))}
        onCancel={close}
        analytics={{ title: UpgradeToKVM.title }}
        errors={errors}
      >
        <div>
          <p>
            <strong>{linode.label}</strong> will be shut down, migrated to a KVM host, and then
            booted back up. Specific changes from Xen to KVM are detailed in
            our <ExternalLink to="https://www.linode.com/docs/platform/kvm">KVM Reference guide</ExternalLink>.
          </p>
          <p>
            {/* eslint-disable max-len */}
            To migrate {(type.disk / 1024)} GiB of disks will take about {migrateEst} minutes to complete.
            {/* eslint-enable max-len */}
          </p>
        </div>
      </ConfirmModalBody>
    );
  }
}

UpgradeToKVM.propTypes = {
  linode: PropTypes.object.isRequired,
  type: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired,
};
