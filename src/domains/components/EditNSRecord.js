import React, { PropTypes, Component } from 'react';

import { Input, ModalFormGroup } from 'linode-components/forms';
import { FormModalBody } from 'linode-components/modals';

import { domains } from '~/api';
import { dispatchOrStoreErrors } from '~/api/util';

import SelectDNSSeconds from './SelectDNSSeconds';


export default class EditNSRecord extends Component {
  constructor(props) {
    super();

    const { id, zone: { ttl_sec: defaultTTL, domain: zone } } = props;
    const {
      target: nameserver,
      name: subdomain,
      ttl_sec: ttl,
    } = props.zone._records.records[id] || {};

    this.state = {
      errors: {},
      loading: false,
      zone,
      defaultTTL,
      ttl,
      nameserver,
      subdomain,
    };
  }

  onSubmit = () => {
    const { dispatch, id, close } = this.props;
    const { ttl, nameserver, subdomain } = this.state;
    const ids = [this.props.zone.id, id].filter(Boolean);

    const data = {
      ttl_sec: +ttl,
      target: nameserver,
      // '' is the default and will track the zone
      name: subdomain === this.props.zone.domain ? '' : subdomain,
      type: 'NS',
    };

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => domains.records[id ? 'put' : 'post'](data, ...ids),
      close,
    ]));
  }

  onChange = ({ target: { name, value } }) => this.setState({ [name]: value })

  render() {
    const { close, title, id } = this.props;
    const { errors, zone, defaultTTL, ttl, nameserver, subdomain } = this.state;

    const analytics = { title, action: id ? 'edit' : 'add' };

    return (
      <FormModalBody
        onSubmit={this.onSubmit}
        onCancel={close}
        buttonText={id ? undefined : 'Add NS Record'}
        buttonDisabledText={id ? undefined : 'Adding NS Record'}
        analytics={analytics}
        errors={errors}
      >
        <div>
          <ModalFormGroup errors={errors} id="nameserver" label="Name Server" apiKey="target">
            <Input
              id="nameserver"
              name="nameserver"
              value={nameserver}
              placeholder="ns1.domain.com"
              onChange={this.onChange}
            />
          </ModalFormGroup>
          <ModalFormGroup label="Subdomain" id="subdomain" apiKey="name" errors={errors}>
            <Input
              id="subdomain"
              name="subdomain"
              value={subdomain || zone}
              placeholder="domain.com"
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

EditNSRecord.propTypes = {
  dispatch: PropTypes.func.isRequired,
  zone: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  close: PropTypes.func.isRequired,
  id: PropTypes.number,
};
