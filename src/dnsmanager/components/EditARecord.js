import React, { PropTypes, Component } from 'react';

import { dnszones } from '~/api';
import { ModalFormGroup } from '~/components/form';
import SelectDNSSeconds from './SelectDNSSeconds';
import { Form, Select, Input, SubmitButton, CancelButton } from '~/components/form';
import { reduceErrors, ErrorSummary } from '~/errors';

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
      saving: false,
    };
  }

  onSubmit = async () => {
    const { dispatch, id } = this.props;
    const { ttl, hostname, ip, type } = this.state;

    this.setState({ saving: true });

    try {
      const ids = [this.props.zone.id, id].filter(Boolean);

      await dispatch(dnszones.records[id ? 'put' : 'post']({
        type,
        ttl_sec: +ttl,
        target: ip,
        // '' is the default and will track the zone
        name: hostname,
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

  onChange = ({ target: { name, value } }) => this.setState({ [name]: value })

  render() {
    const { close } = this.props;
    const { errors, saving, defaultTTL, type, ttl, ip, hostname } = this.state;

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
        <ModalFormGroup label="Type" id="type" apiKey="type" errors={errors}>
          <Select
            id="type"
            name="type"
            value={type || 'A'}
            disabled={this.props.id}
            defaultSeconds={defaultTTL}
            onChange={this.onChange}
          >
            <option value="A">A</option>
            <option value="AAAA">AAAA</option>
          </Select>
        </ModalFormGroup>
        <div className="Modal-footer">
          <CancelButton onClick={close} />
          <SubmitButton disabled={saving}>
            {this.props.id ? 'Save' : 'Add A/AAAA Record'}
          </SubmitButton>
        </div>
        <ErrorSummary errors={errors} />
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
