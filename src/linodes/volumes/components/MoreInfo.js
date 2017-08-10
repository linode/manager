import React, { Component, PropTypes } from 'react';

import { ExternalLink } from 'linode-components/buttons';
import { ModalFormGroup, Input, Textarea } from 'linode-components/forms';
import { FormModalBody } from 'linode-components/modals';

import { IPV4_DNS_RESOLVERS, IPV6_DNS_RESOLVERS } from '~/constants';
import { showModal, hideModal } from '~/actions/modal';


export default class MoreInfo extends Component {
  static title = 'Volume Configuration'

  static trigger(dispatch, volume) {
    return dispatch(showModal(MoreInfo.title, (
      <FormModalBody
        onSubmit={() => dispatch(hideModal())}
        noCancel
        buttonText="Done"
        buttonDisableText="Done"
        analytics={{ title: MoreInfo.title, action: 'info' }}
      >
        <MoreInfo dispatch={dispatch} volume={volume} />
      </FormModalBody>
    )));
  }

  render() {
    const { volume: { label } } = this.props;

    return (
      <div>
        <p>
          To get started with a new volume, you'll want to create a filesystem on it:
        </p>
        <code><pre>mkfs.ext4 /dev/disk/by-id/scsi-0Linode_Volume_{label}</pre></code>
        <p>
          Once the volume has a filesystem, you can create a mountpoint for it:
        </p>
        <code><pre>mkdir /mnt/{label}</pre></code>
        <p>
          Then you can mount the new volume:
        </p>
        <code><pre>mount /dev/disk/by-id/scsi-0Linode_Volume_{label} /mnt/{label}</pre></code>
        <p>
          If you want the volume to automatically mount every time your Linode boots, you'll want to add a line like the following to your <strong>/etc/fstab</strong> file:
        </p>
        <code><pre>/dev/disk/by-id/scsi-0Linode_Volume_{label} /mnt/{label} ext4 defaults 0 2</pre></code>
        <p>For more info see the <ExternalLink to="https://www.linode.com/docs/platform/how-to-use-block-storage-with-your-linode">docs</ExternalLink>.</p>
      </div>
    );
  }
}

MoreInfo.propTypes = {
  volume: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
};
