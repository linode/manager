import React, { PropTypes, Component } from 'react';

import { domains } from '~/api';
import { ModalFormGroup } from '~/components/form';
import SelectDNSSeconds from './SelectDNSSeconds';
import { Form, Input, SubmitButton } from '~/components/form';
import { CancelButton } from '~/components/buttons';
import { reduceErrors, ErrorSummary } from '~/errors';

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
      saving: false,
      zone,
      defaultTTL,
      ttl,
      nameserver,
      subdomain,
    };
  }

  onSubmit = async () => {
    const { dispatch, id } = this.props;
    const { ttl, nameserver, subdomain } = this.state;

    this.setState({ errors: {}, saving: true });

    try {
      const ids = [this.props.zone.id, id].filter(Boolean);

      await dispatch(domains.records[id ? 'put' : 'post']({
        ttl_sec: +ttl,
        target: nameserver,
        // '' is the default and will track the zone
        name: subdomain === this.props.zone.domain ? '' : subdomain,
        type: 'NS',
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
    const { errors, saving, zone, defaultTTL, ttl, nameserver, subdomain } = this.state;

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
          <CancelButton onClick={close} />
          <SubmitButton disabled={saving}>{this.props.id ? 'Save' : 'Add NS Record'}</SubmitButton>
        </div>
        <ErrorSummary errors={errors} />
      </Form>
    );
  }
}

EditNSRecord.propTypes = {
  dispatch: PropTypes.func.isRequired,
  zone: PropTypes.object.isRequired,
  close: PropTypes.func.isRequired,
  id: PropTypes.number,
};
