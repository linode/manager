import React, { PropTypes, Component } from 'react';

import { Input, ModalFormGroup, Select } from 'linode-components/forms';
import { onChange } from 'linode-components/forms/utilities';
import { FormModalBody } from 'linode-components/modals';

import { domains } from '~/api';
import { dispatchOrStoreErrors } from '~/api/util';

import SelectDNSSeconds from './SelectDNSSeconds';


export default class EditSRVRecord extends Component {
  constructor(props) {
    super();

    const { id, zone: { ttl_sec: defaultTTL } } = props;
    const {
      service,
      protocol,
      target,
      priority,
      weight,
      port,
      ttl_sec: ttl,
    } = props.zone._records.records[id] || {};

    this.state = {
      errors: {},
      defaultTTL,
      ttl,
      priority,
      weight,
      port,
      service: service || '',
      protocol: protocol || '_tcp',
      target,
    };

    this.onChange = onChange.bind(this);
  }

  onSubmit = () => {
    const { dispatch, id, close } = this.props;
    const {
      ttl, service, protocol, target, priority, weight, port,
    } = this.state;
    const ids = [this.props.zone.id, id].filter(Boolean);
    const data = {
      ttl_sec: +ttl,
      service,
      protocol,
      target,
      priority: +priority,
      weight: +weight,
      port: +port,
      type: 'SRV',
    };

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => domains.records[id ? 'put' : 'post'](data, ...ids),
      close,
    ]));
  }

  render() {
    const { close, title, id } = this.props;
    const {
      errors, defaultTTL, ttl, service, protocol, target, priority, weight, port,
    } = this.state;

    const analytics = { title, action: id ? 'edit' : 'add' };

    const protocolOptions = [
      { value: '_tcp', label: 'tcp' },
      { value: '_udp', label: 'udp' },
      { value: '_xmpp', label: 'xmpp' },
      { value: '_tls', label: 'tls' },
      { value: '_smtp', label: 'smtp' },
    ];

    return (
      <FormModalBody
        onSubmit={this.onSubmit}
        onCancel={close}
        buttonText={id ? undefined : 'Add SRV Record'}
        buttonDisabledText={id ? undefined : 'Adding SRV Record'}
        analytics={analytics}
        errors={errors}
      >
        <div>
          <ModalFormGroup id="service" label="Service" apiKey="name" errors={errors}>
            <Input
              id="service"
              name="service"
              value={service}
              placeholder="_sip"
              onChange={this.onChange}
            />
          </ModalFormGroup>
          <ModalFormGroup id="protocol" label="Protocol" apiKey="protocol" errors={errors}>
            <Select
              id="protocol"
              name="protocol"
              value={protocol}
              onChange={this.onChange}
              options={protocolOptions}
            />
          </ModalFormGroup>
          <ModalFormGroup id="target" label="Target" apiKey="target" errors={errors}>
            <Input
              name="target"
              value={target}
              placeholder="sipserver"
              onChange={this.onChange}
            />
          </ModalFormGroup>
          <ModalFormGroup id="priority" label="Priority" apiKey="priority" errors={errors}>
            <Input
              id="priority"
              name="priority"
              value={priority}
              placeholder="10"
              type="number"
              min={0}
              max={255}
              onChange={this.onChange}
            />
          </ModalFormGroup>
          <ModalFormGroup id="weight" label="Weight" apiKey="weight" errors={errors}>
            <Input
              id="weight"
              name="weight"
              value={weight}
              placeholder="5"
              type="number"
              min={0}
              max={255}
              onChange={this.onChange}
            />
          </ModalFormGroup>
          <ModalFormGroup id="port" label="Port" apiKey="port" errors={errors}>
            <Input
              id="port"
              name="port"
              value={port}
              placeholder="80"
              type="number"
              min={0}
              max={65535}
              onChange={this.onChange}
            />
          </ModalFormGroup>
          <ModalFormGroup label="TTL" id="ttl" apiKey="ttl_sec" errors={errors}>
            <SelectDNSSeconds
              id="ttl"
              name="ttl"
              value={ttl}
              defaultSeconds={defaultTTL}
              onChange={this.onChange}
            />
          </ModalFormGroup>
        </div>
      </FormModalBody>
    );
  }
}

EditSRVRecord.propTypes = {
  dispatch: PropTypes.func.isRequired,
  zone: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  close: PropTypes.func.isRequired,
  id: PropTypes.number,
};
