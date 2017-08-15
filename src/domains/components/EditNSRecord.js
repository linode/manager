import React, { PropTypes, Component } from 'react';

import { Input, ModalFormGroup } from 'linode-components/forms';
import { onChange } from 'linode-components/forms/utilities';
import { FormModalBody } from 'linode-components/modals';

import { domains } from '~/api';
import { dispatchOrStoreErrors } from '~/api/util';

import DomainInput from './DomainInput';
import SelectDNSSeconds from './SelectDNSSeconds';


export default class EditNSRecord extends Component {
  constructor(props) {
    super();

    const { id, zone: { ttl_sec: defaultTTL, domain } } = props;
    const {
      target,
      name,
      ttl_sec: ttl,
    } = props.zone._records.records[id] || {};

    const subdomain = DomainInput.stripBase(name, domain);
    this.state = {
      errors: {},
      loading: false,
      defaultTTL,
      ttl,
      nameserver: target,
      subdomain,
    };

    this.onChange = onChange.bind(this);
  }

  onSubmit = () => {
    const { dispatch, id, close, zone } = this.props;
    const { ttl, nameserver, subdomain } = this.state;
    const ids = [zone.id, id].filter(Boolean);

    const data = {
      ttl_sec: +ttl,
      target: nameserver,
      name: subdomain,
      type: 'NS',
    };

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => domains.records[id ? 'put' : 'post'](data, ...ids),
      close,
    ]));
  }

  render() {
    const { close, title, id, zone } = this.props;
    const { errors, defaultTTL, ttl, nameserver, subdomain } = this.state;

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
              name="nameserver"
              placeholder={`ns1.${zone.domain}`}
              value={nameserver}
              onChange={this.onChange}
            />
          </ModalFormGroup>
          <ModalFormGroup label="Subdomain" id="subdomain" apiKey="name" errors={errors}>
            <DomainInput
              name="subdomain"
              value={subdomain}
              base={zone.domain}
              onChange={this.onChange}
            />
            <div>
              <small className="text-muted">
                You probably want to leave this blank.
              </small>
            </div>
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
