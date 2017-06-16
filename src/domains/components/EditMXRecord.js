import React, { PropTypes, Component } from 'react';

import { ModalFormGroup } from 'linode-components/forms';
import {
  Form,
  FormSummary,
  Input,
  SubmitButton,
} from 'linode-components/forms';
import { CancelButton } from 'linode-components/buttons';

import { domains } from '~/api';
import { dispatchOrStoreErrors } from '~/api/util';


export default class EditMXRecord extends Component {
  constructor(props) {
    super();

    const { id, zone: { domain: zone } } = props;
    const {
      target: mailserver,
      name: subdomain,
      priority: preference,
    } = props.zone._records.records[id] || {};

    this.state = {
      errors: {},
      loading: false,
      zone,
      mailserver,
      subdomain,
      preference,
    };
  }

  onSubmit = () => {
    const { dispatch, id, close } = this.props;
    const { mailserver, subdomain, preference } = this.state;
    const ids = [this.props.zone.id, id].filter(Boolean);
    const data = {
      target: mailserver,
      // '' is the default and will track the zone
      name: subdomain === this.props.zone.domain ? '' : subdomain,
      priority: +preference,
      type: 'MX',
    };

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => domains.records[id ? 'put' : 'post'](data, ...ids),
      close,
    ]));
  }

  onChange = ({ target: { name, value } }) => this.setState({ [name]: value })

  render() {
    const { close } = this.props;
    const { errors, loading, zone, subdomain, preference, mailserver } = this.state;

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
          <SubmitButton
            disabled={loading}
            disabledChildren={this.props.id ? undefined : 'Adding MX Record'}
          >
            {this.props.id ? undefined : 'Add MX Record'}
          </SubmitButton>
          <FormSummary errors={errors} />
        </div>
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
