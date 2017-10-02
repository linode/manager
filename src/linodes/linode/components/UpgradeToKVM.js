import React, { Component, PropTypes } from 'react';

import { ExternalLink } from 'linode-components/buttons';
import { FormModalBody } from 'linode-components/modals';
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
    const migrateEst = Math.round(linode.disk / (4000 / 60) / 60);

    return (
      <FormModalBody
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
            Linode will need to shut down and migrate to KVM before receiving plan upgrade.
            Specific changes from Xen to KVM are detailed in
            our <ExternalLink to="https://www.linode.com/docs/platform/kvm">KVM Reference guide</ExternalLink>.
          </p>
          <p>
            Are you sure you want to <strong>permanently</strong> convert {linode.label} to KVM?
          </p>
          <p>
            {/* eslint-disable max-len */}
            To migrate {(linode.disk / 1024)} GiB worth of disks will take about {migrateEst} minutes to complete.
            {/* eslint-enable max-len */}
          </p>
        </div>
      </FormModalBody>
    );
  }
}

UpgradeToKVM.propTypes = {
  linode: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
};
