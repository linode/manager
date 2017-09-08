import React, { PropTypes, Component } from 'react';

import { Input, ModalFormGroup } from 'linode-components/forms';
import { onChange } from 'linode-components/forms/utilities';
import { FormModalBody } from 'linode-components/modals';

import { domains } from '~/api';
import { dispatchOrStoreErrors } from '~/api/util';

import DomainInput from './DomainInput';
import SelectDNSSeconds from './SelectDNSSeconds';


export default class EditCNAMERecord extends Component {
  constructor(props) {
    super();

    const { id, zone: { domain, ttl_sec: defaultTTL } } = props;
    const {
      target,
      name,
      ttl_sec: ttl,
    } = props.zone._records.records[id] || {};

    const hostname = DomainInput.stripBase(name, domain);
    this.state = {
      errors: {},
      defaultTTL,
      ttl,
      hostname,
      alias: target,
    };

    this.onChange = onChange.bind(this);
  }

  onSubmit = () => {
    const { dispatch, id, close, zone } = this.props;
    const { ttl, hostname, alias } = this.state;
    const ids = [zone.id, id].filter(Boolean);
    const data = {
      ttl_sec: +ttl,
      name: hostname,
      target: alias,
      type: 'CNAME',
    };

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => domains.records[id ? 'put' : 'post'](data, ...ids),
      close,
    ]));
  }

  render() {
    const { close, title, id, zone } = this.props;
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
            <DomainInput
              name="hostname"
              value={hostname}
              placeholder="www2"
              base={zone.domain}
              onChange={this.onChange}
            />
          </ModalFormGroup>
          <ModalFormGroup label="Aliases to" id="alias" apiKey="target" errors={errors}>
            <Input
              name="alias"
              value={alias}
              placeholder={`www3.${zone.domain}`}
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
