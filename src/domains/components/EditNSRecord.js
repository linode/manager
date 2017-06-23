import React, { PropTypes, Component } from 'react';

import {
  Form,
  FormSummary,
  Input,
  SubmitButton,
  ModalFormGroup,
} from 'linode-components/forms';
import { CancelButton } from 'linode-components/buttons';

import { domains } from '~/api';
import { dispatchOrStoreErrors } from '~/api/util';
import { TrackEvent } from '~/actions/trackEvent.js';

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
    const { dispatch, id, title, close } = this.props;
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
      () => TrackEvent('Modal', 'add', title),
      close,
    ]));
  }

  onChange = ({ target: { name, value } }) => this.setState({ [name]: value })

  render() {
    const { close, title } = this.props;
    const { errors, loading, zone, defaultTTL, ttl, nameserver, subdomain } = this.state;

    return (
      <Form onSubmit={this.onSubmit}>
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
        <div className="Modal-footer">
          <CancelButton
            onClick={() => {
              TrackEvent('Modal', 'cancel', title);
              close();
            }}
          />
          <SubmitButton
            disabled={loading}
            disabledChildren={this.props.id ? undefined : 'Adding NS Record'}
          >
            {this.props.id ? undefined : 'Add NS Record'}
          </SubmitButton>
          <FormSummary errors={errors} />
        </div>
      </Form>
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
