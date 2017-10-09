import React, { Component, PropTypes } from 'react';

import { ExternalLink } from 'linode-components/buttons';
import { ConfirmModalBody } from 'linode-components/modals';
import { showModal, hideModal } from '~/actions/modal';
import { kvmifyLinode } from '~/api/linodes';
import { dispatchOrStoreErrors } from '~/api/util';


export default class UpgradeToKVM extends Component {
  static title = 'Upgrade to KVM';
  static trigger(dispatch, linode) {
    return dispatch(showModal(UpgradeToKVM.title, (
      <UpgradeToKVM
        dispatch={dispatch}
        linode={linode}
      />
    )));
  }

  constructor(props) {
    super(props);

    this.state = { errors: {} };
  }

  render() {
    const { dispatch, linode } = this.props;
    const { errors } = this.state;
    const migrateEst = Math.round(linode.type.disk / (4000 / 60) / 60);

    return (
      <ConfirmModalBody
        onSubmit={() => dispatch(dispatchOrStoreErrors.call(this, [
          () => kvmifyLinode(linode.id),
          hideModal,
        ]))}
        onCancel={() => dispatch(hideModal())}
        analytics={{ title: UpgradeToKVM.title }}
        errors={errors}
      >
        <div>
          <p>
            <strong>{linode.label}</strong> will be shut down, migrated to a KVM box, and then
            booted back up. Specific changes from Xen to KVM are detailed in
            our <ExternalLink to="https://www.linode.com/docs/platform/kvm">KVM Reference guide</ExternalLink>.
          </p>
          <p>
            {/* eslint-disable max-len */}
            To migrate {(linode.type.disk / 1024)} GiB of disks will take about {migrateEst} minutes to complete.
            {/* eslint-enable max-len */}
          </p>
        </div>
      </ConfirmModalBody>
    );
  }
}

UpgradeToKVM.propTypes = {
  linode: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
};
