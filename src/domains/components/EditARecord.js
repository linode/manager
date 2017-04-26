import React, { PropTypes, Component } from 'react';

import { Form, Select, Input, SubmitButton, ModalFormGroup } from 'linode-components/forms';
import { CancelButton } from 'linode-components/buttons';

import { domains } from '~/api';
import { dispatchOrStoreErrors, FormSummary } from '~/components/forms';

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
      loading: false,
    };
  }

  onSubmit = async () => {
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

    await dispatch(dispatchOrStoreErrors.apply(this, [
      [
        () => domains.records[id ? 'put' : 'post'](data, ...ids),
        close,
      ]
    ]));
  }

  onChange = ({ target: { name, value } }) => this.setState({ [name]: value })

  render() {
    const { close } = this.props;
    const { errors, loading, defaultTTL, type, ttl, ip, hostname } = this.state;

    return (
      <Form onSubmit={this.onSubmit}>
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
            placeholder="1.1.1.1"
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
        {this.props.id ? null : (
          <ModalFormGroup label="Type" id="type" apiKey="type" errors={errors}>
            <Select
              id="type"
              name="type"
              value={type || 'A'}
              defaultSeconds={defaultTTL}
              onChange={this.onChange}
            >
              <option value="A">A</option>
              <option value="AAAA">AAAA</option>
            </Select>
          </ModalFormGroup>)}
        <div className="Modal-footer">
          <CancelButton onClick={close} />
          <SubmitButton
            disabled={loading}
            disabledChildren={this.props.id ? undefined : 'Adding A/AAAA Record'}
          >
            {this.props.id ? undefined : 'Add A/AAAA Record'}
          </SubmitButton>
          <FormSummary errors={errors} />
        </div>
      </Form>
    );
  }
}

EditARecord.propTypes = {
  dispatch: PropTypes.func.isRequired,
  zone: PropTypes.object.isRequired,
  close: PropTypes.func.isRequired,
  id: PropTypes.number,
};
