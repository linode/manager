import React, { PropTypes, Component } from 'react';

import { Form, Input, Select, SubmitButton, ModalFormGroup } from 'linode-components/forms';
import { CancelButton } from 'linode-components/buttons';

import { domains } from '~/api';
import { dispatchOrStoreErrors, FormSummary } from '~/components/forms';

import SelectDNSSeconds from './SelectDNSSeconds';


export default class EditSRVRecord extends Component {
  constructor(props) {
    super();

    const { id, zone: { ttl_sec: defaultTTL, domain: zone } } = props;
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
      loading: false,
      zone,
      defaultTTL,
      ttl,
      service: service || '',
      protocol: protocol || '_tcp',
      target: target || '',
      // eslint-disable-next-line
      priority: priority,
      // eslint-disable-next-line
      weight: weight,
      // eslint-disable-next-line
      port: port,
    };
  }

  onSubmit = () => {
    const { dispatch, id, close } = this.props;
    const { ttl, service, protocol, target, priority, weight, port } = this.state;
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

  onChange = ({ target: { name, value } }) => this.setState({ [name]: value });

  render() {
    const { close } = this.props;
    const {
      errors,
      loading,
      defaultTTL,
      ttl,
      service,
      protocol,
      target,
      priority,
      weight,
      port,
    } = this.state;
    return (
      <Form onSubmit={this.onSubmit}>
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
          >
            <option value="_tcp">tcp</option>
            <option value="_udp">udp</option>
            <option value="_xmpp">xmpp</option>
            <option value="_tls">tls</option>
            <option value="_smtp">smtp</option>
          </Select>
        </ModalFormGroup>
        <ModalFormGroup id="target" label="Target" apiKey="target" errors={errors}>
          <Input
            id="target"
            name="target"
            value={target}
            placeholder=""
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
        <div className="Modal-footer">
          <CancelButton onClick={close} />
          <SubmitButton
            disabled={loading}
            disabledChildren={this.props.id ? undefined : 'Adding SRV Record'}
          >
            {this.props.id ? undefined : 'Add SRV Record'}
          </SubmitButton>
          <FormSummary errors={errors} />
        </div>
      </Form>
    );
  }
}

EditSRVRecord.propTypes = {
  dispatch: PropTypes.func.isRequired,
  zone: PropTypes.object.isRequired,
  close: PropTypes.func.isRequired,
  id: PropTypes.number,
};
