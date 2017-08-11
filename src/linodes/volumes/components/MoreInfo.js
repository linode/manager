import React, { Component, PropTypes } from 'react';

import { ExternalLink } from 'linode-components/buttons';
import { Code } from 'linode-components/formats';
import { FormModalBody } from 'linode-components/modals';

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
        <Code example={`mkfs.ext4 /dev/disk/by-id/scsi-0Linode_Volume_${label}`} />
        <p>
          Once the volume has a filesystem, you can create a mountpoint for it:
        </p>
        <Code example={`mkdir /mnt/${label}`} />
        <p>
          Then you can mount the new volume:
        </p>
        <Code example={`mount /dev/disk/by-id/scsi-0Linode_Volume_${label} /mnt/${label}`} />
        <p>
          {/* eslint-disable max-len */}
          If you want the volume to automatically mount every time your Linode boots, you'll want to add a line like the following to your <strong>/etc/fstab</strong> file:
          {/* eslint-enable max-len */}
        </p>
        {/* eslint-disable max-len */}
        <Code example={`/dev/disk/by-id/scsi-0Linode_Volume_${label} /mnt/${label} ext4 defaults 0 2`} />
        <p>For more info see the <ExternalLink to="https://www.linode.com/docs/platform/how-to-use-block-storage-with-your-linode">docs</ExternalLink>.</p>
        {/* eslint-enable max-len */}
      </div>
    );
  }
}

MoreInfo.propTypes = {
  volume: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
};
