import React, { PropTypes, Component } from 'react';

import { dnszones } from '~/api';
import { ModalFormGroup } from '~/components/form';
import SelectDNSSeconds from './SelectDNSSeconds';
import { Form, Input, SubmitButton, CancelButton } from '~/components/form';
import { reduceErrors, ErrorSummary } from '~/errors';

export default class EditCNAMERecord extends Component {
  constructor(props) {
    super();

    const { id, zone: { ttl_sec: defaultTTL, dnszone: zone } } = props;
    const {
      target: alias,
      name: hostname,
      ttl_sec: ttl,
    } = props.zone._records.records[id] || {};

    this.state = {
      errors: {},
      saving: false,
      zone,
      defaultTTL,
      ttl,
      hostname,
      alias,
    };
  }

  onSubmit = async () => {
    const { dispatch, id } = this.props;
    const { ttl, hostname, alias } = this.state;

    this.setState({ saving: true });

    try {
      const ids = [this.props.zone.id, id].filter(Boolean);

      await dispatch(dnszones.records[id ? 'put' : 'post']({
        ttl_sec: +ttl,
        name: hostname,
        target: alias,
        type: 'CNAME',
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
    const { errors, saving, defaultTTL, ttl, hostname, alias } = this.state;

    return (
      <Form onSubmit={this.onSubmit}>
        <ModalFormGroup errors={errors} id="hostname" label="Hostname" apiKey="name">
          <Input
            id="hostname"
            name="hostname"
            value={hostname}
            placeholder="www.thisdomain.com"
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
        <div className="Modal-footer">
          <CancelButton onClick={close} />
          <SubmitButton disabled={saving}>
            {this.props.id ? 'Save' : 'Add CNAME Record'}
          </SubmitButton>
        </div>
        <ErrorSummary errors={errors} />
      </Form>
    );
  }
}

EditCNAMERecord.propTypes = {
  dispatch: PropTypes.func.isRequired,
  zone: PropTypes.object.isRequired,
  close: PropTypes.func.isRequired,
  id: PropTypes.number,
};
