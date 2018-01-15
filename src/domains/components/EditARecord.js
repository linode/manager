import PropTypes from 'prop-types';
import React, { Component } from 'react';

import Input from 'linode-components/dist/forms/Input';
import ModalFormGroup from 'linode-components/dist/forms/ModalFormGroup';
import { onChange } from 'linode-components/dist/forms/utilities';
import FormModalBody from 'linode-components/dist/modals/FormModalBody';

import api from '~/api';
import { dispatchOrStoreErrors } from '~/api/util';

import SelectDNSSeconds from './SelectDNSSeconds';


export default class EditARecord extends Component {
  constructor(props) {
    super();

    const { id, zone: { ttl_sec: defaultTTL } } = props;
    const {
      type,
      target: ip,
      name: hostname,
      ttl_sec: ttl,
    } = props.zone._records.records[id] || {};

    this.state = {
      defaultTTL,
      ttl,
      hostname,
      ip,
      type: type || 'A',
      errors: {},
    };

    this.onChange = onChange.bind(this);
  }

  onIPChange = ({ target: { value } }) => {
    const type = value.indexOf(':') !== -1 ? 'AAAA' : 'A';
    this.setState({ type: value ? type : this.state.type, ip: value });
  }

  onSubmit = () => {
    const { dispatch, id, close } = this.props;
    const { ttl, hostname, ip, type } = this.state;
    const ids = [this.props.zone.id, id].filter(Boolean);
    const data = {
      type,
      ttl_sec: +ttl,
      target: ip,
      // '' is the default and will track the zone
      name: hostname,
    };

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => api.domains.records[id ? 'put' : 'post'](data, ...ids),
      close,
    ]));
  }

  render() {
    const { id, close, title } = this.props;
    const { errors, defaultTTL, type, ttl, ip, hostname } = this.state;

    const analytics = { title, action: id ? 'edit' : 'add' };

    return (
      <FormModalBody
        onSubmit={this.onSubmit}
        onCancel={close}
        buttonText={this.props.id ? undefined : 'Add A/AAAA Record'}
        buttonDisabledText={this.props.id ? undefined : 'Adding A/AAAA Record'}
        errors={errors}
        analytics={analytics}
      >
        <div>
          <ModalFormGroup label="Hostname" id="hostname" apiKey="name" errors={errors}>
            <Input
              id="hostname"
              name="hostname"
              value={hostname}
              placeholder="www"
              onChange={this.onChange}
            />
          </ModalFormGroup>
          <ModalFormGroup label="IP Address" id="ip" apiKey="target" errors={errors}>
            <Input
              id="ip"
              name="ip"
              value={ip}
              placeholder={type === 'A' ?
                '172.16.254.1' :
                '2001:0db8:85a3:0000:0000:8a2e:0370:7334'}
              onChange={this.onIPChange}
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

EditARecord.propTypes = {
  dispatch: PropTypes.func.isRequired,
  zone: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  close: PropTypes.func.isRequired,
  id: PropTypes.number,
};
