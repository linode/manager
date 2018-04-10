import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ExternalLink from 'linode-components/dist/buttons/ExternalLink';
import ModalFormGroup from 'linode-components/dist/forms/ModalFormGroup';
import Input from 'linode-components/dist/forms/Input';
import Textarea from 'linode-components/dist/forms/Textarea';
import FormModalBody from 'linode-components/dist/modals/FormModalBody';

import { IPV4_DNS_RESOLVERS, IPV6_DNS_RESOLVERS } from '~/constants';
import { showModal, hideModal } from '~/actions/modal';


export default class MoreInfo extends Component {
  static title = 'Configure Static Networking'

  static trigger(dispatch, ip) {
    return dispatch(showModal(MoreInfo.title, (
      <FormModalBody
        onSubmit={() => dispatch(hideModal())}
        noCancel
        buttonText="Done"
        buttonDisableText="Done"
        analytics={{ title: MoreInfo.title, action: 'info' }}
      >
        <MoreInfo dispatch={dispatch} ip={ip} />
      </FormModalBody>
    )));
  }

  renderDNSResolvers(resolvers) {
    return (
      <ModalFormGroup label="DNS Resolvers">
        <Textarea
          className="form-control"
          disabled
          rows={resolvers.length}
          value={resolvers.join('\n')}
        />
      </ModalFormGroup>
    );
  }

  renderGateway() {
    const { ip } = this.props;

    if (!ip.gateway) {
      return null;
    }

    return (
      <ModalFormGroup label="Gateway">
        <Input disabled value={ip.gateway} />
      </ModalFormGroup>
    );
  }

  render() {
    const { ip } = this.props;
    const isIPv4 = !!ip.subnet_mask;

    if (isIPv4) {
      return (
        <div>
          <p>For more information, see this <ExternalLink to="https://www.linode.com/docs/networking/linux-static-ip-configuration">guide</ExternalLink> on static IP configuration.</p>
          <ModalFormGroup label="Address">
            <Input disabled value={ip.address} />
          </ModalFormGroup>
          {this.renderGateway()}
          <ModalFormGroup label="Subnet Mask">
            <Input disabled value={ip.subnet_mask} />
          </ModalFormGroup>
          {this.renderDNSResolvers(IPV4_DNS_RESOLVERS)}
        </div>
      );
    }

    return (
      <div>
        <p>For more information, see this <ExternalLink to="https://www.linode.com/docs/networking/linux-static-ip-configuration">guide</ExternalLink> on static IP configuration and this <ExternalLink to="https://www.linode.com/docs/networking/native-ipv6-networking">guide</ExternalLink> on IPv6 networking.</p>
        <ModalFormGroup label={ip.key.toLowerCase() === 'pool' ? 'Range' : 'Address'}>
          <Input disabled value={ip.address} />
        </ModalFormGroup>
        {this.renderGateway()}
        {this.renderDNSResolvers(IPV6_DNS_RESOLVERS)}
      </div>
    );
  }
}

MoreInfo.propTypes = {
  ip: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
};
