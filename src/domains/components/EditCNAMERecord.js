import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { Input, ModalFormGroup } from 'linode-components';
import { onChange } from 'linode-components';
import { FormModalBody } from 'linode-components';

import api from '~/api';
import { dispatchOrStoreErrors } from '~/api/util';

import SelectDNSSeconds from './SelectDNSSeconds';


export default class EditCNAMERecord extends Component {
  constructor(props) {
    super();

    const { id, zone: { ttl_sec: defaultTTL, domain: zone } } = props;
    const {
      target: alias,
      name: hostname,
      ttl_sec: ttl,
    } = props.zone._records.records[id] || {};

    this.state = {
      errors: {},
      zone,
      defaultTTL,
      ttl,
      hostname,
      alias,
    };

    this.onChange = onChange.bind(this);
  }

  onSubmit = () => {
    const { dispatch, id, close } = this.props;
    const { ttl, hostname, alias } = this.state;
    const ids = [this.props.zone.id, id].filter(Boolean);
    const data = {
      ttl_sec: +ttl,
      name: hostname,
      target: alias,
      type: 'CNAME',
    };

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => api.domains.records[id ? 'put' : 'post'](data, ...ids),
      close,
    ]));
  }

  render() {
    const { close, title, id } = this.props;
    const { errors, defaultTTL, ttl, hostname, alias } = this.state;

    const analytics = { title, action: id ? 'edit' : 'add' };

    return (
      <FormModalBody
        onSubmit={this.onSubmit}
        onCancel={close}
        buttonText={id ? undefined : 'Add CNAME Record'}
        buttonDisabledText={id ? undefined : 'Adding CNAME Record'}
        analytics={analytics}
        errors={errors}
      >
        <div>
          <ModalFormGroup errors={errors} id="hostname" label="Hostname" apiKey="name">
            <Input
              id="hostname"
              name="hostname"
              value={hostname}
              placeholder="www"
              onChange={this.onChange}
            />
          </ModalFormGroup>
          <ModalFormGroup label="Aliases to" id="alias" apiKey="target" errors={errors}>
            <Input
              id="alias"
              name="alias"
              value={alias}
              placeholder="www.otherdomain.com"
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

EditCNAMERecord.propTypes = {
  dispatch: PropTypes.func.isRequired,
  zone: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  close: PropTypes.func.isRequired,
  id: PropTypes.number,
};
