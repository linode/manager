import React, { PropTypes, Component } from 'react';

import { dnszones } from '~/api';
import { ModalFormGroup } from '~/components/form';
import { Form, Input, SubmitButton } from '~/components/form';
import { CancelButton } from '~/components/buttons';
import { reduceErrors, ErrorSummary } from '~/errors';

export default class EditMXRecord extends Component {
  constructor(props) {
    super();

    const { id, zone: { dnszone: zone } } = props;
    const {
      target: mailserver,
      name: subdomain,
      priority: preference,
    } = props.zone._records.records[id] || {};

    this.state = {
      errors: {},
      saving: false,
      zone,
      mailserver,
      subdomain,
      preference,
    };
  }

  onSubmit = async () => {
    const { dispatch, id } = this.props;
    const { mailserver, subdomain, preference } = this.state;

    this.setState({ errors: {}, saving: true });

    try {
      const ids = [this.props.zone.id, id].filter(Boolean);

      await dispatch(dnszones.records[id ? 'put' : 'post']({
        target: mailserver,
        // '' is the default and will track the zone
        name: subdomain === this.props.zone.dnszone ? '' : subdomain,
        priority: +preference,
        type: 'MX',
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
    const { errors, saving, zone, subdomain, preference, mailserver } = this.state;

    return (
      <Form onSubmit={this.onSubmit}>
        <ModalFormGroup id="mailserver" label="Mail Server" apiKey="target" errors={errors}>
          <Input
            id="mailserver"
            name="mailserver"
            value={mailserver}
            placeholder="mx.domain.com"
            onChange={this.onChange}
          />
        </ModalFormGroup>
        <ModalFormGroup label="Preference" id="preference" apiKey="priority" errors={errors}>
          <Input
            id="preference"
            name="preference"
            value={preference}
            placeholder="10"
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
        <div className="Modal-footer">
          <CancelButton onClick={close} />
          <SubmitButton disabled={saving}>{this.props.id ? 'Save' : 'Add MX Record'}</SubmitButton>
        </div>
        <ErrorSummary errors={errors} />
      </Form>
    );
  }
}

EditMXRecord.propTypes = {
  dispatch: PropTypes.func.isRequired,
  zone: PropTypes.object.isRequired,
  close: PropTypes.func.isRequired,
  id: PropTypes.number,
};
