import React, { PropTypes, Component } from 'react';

import { dnszones } from '~/api';
import { ModalFormGroup } from '~/components/form';
import SelectDNSSeconds from './SelectDNSSeconds';
import { Form, Input, Select, SubmitButton, CancelButton } from '~/components/form';
import { reduceErrors, ErrorSummary } from '~/errors';

export default class EditSRVRecord extends Component {
  constructor(props) {
    super();

    const { id, zone: { ttl_sec: defaultTTL, dnszone: zone } } = props;
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
      saving: false,
      zone,
      defaultTTL,
      ttl,
      service: service || '',
      protocol: protocol || '_tcp',
      target: target || '',
      priority: priority || '',
      weight: weight || '',
      port: port || '',
    };
  }

  onSubmit = async () => {
    const { dispatch, id } = this.props;
    const { ttl,
      service,
      protocol,
      target,
      priority,
      weight,
      port,
    } = this.state;

    this.setState({ saving: true });

    try {
      const ids = [this.props.zone.id, id].filter(Boolean);

      await dispatch(dnszones.records[id ? 'put' : 'post']({
        ttl_sec: +ttl,
        service,
        protocol,
        target,
        priority: +priority,
        weight: +weight,
        port: +port,
        type: 'SRV',
      }, ...ids));

      this.setState({ saving: false });
      this.props.close();
    } catch (response) {
      if (!response.json) {
        // eslint-disable-next-line no-console
        return console.error(response);
      }

      const errors = await reduceErrors(response);
      this.setState({ errors, saving: false });
    }
  }

  onChange = ({ target: { name, value } }) => this.setState({ [name]: value });

  render() {
    const { close } = this.props;
    const {
      errors,
      saving,
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
        <ModalFormGroup id="service" label="Service" apiKey="service" errors={errors}>
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
          <SubmitButton disabled={saving}>{this.props.id ? 'Save' : 'Add SRV Record'}</SubmitButton>
        </div>
        <ErrorSummary errors={errors} />
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
