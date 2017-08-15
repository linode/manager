import React, { PropTypes, Component } from 'react';

import { ModalFormGroup, Input } from 'linode-components/forms';
import { onChange } from 'linode-components/forms/utilities';
import { FormModalBody } from 'linode-components/modals';

import { domains } from '~/api';
import { dispatchOrStoreErrors } from '~/api/util';

import DomainInput from './DomainInput';


export default class EditMXRecord extends Component {
  constructor(props) {
    super();

    const { id, zone: { domain } } = props;
    const {
      target,
      name,
      priority: preference,
    } = props.zone._records.records[id] || {};

    const subdomain = DomainInput.stripBase(name, domain);
    this.state = {
      errors: {},
      mailserver: target,
      subdomain,
      preference,
    };

    this.onChange = onChange.bind(this);
  }

  onSubmit = () => {
    const { dispatch, id, close, zone } = this.props;
    const { mailserver, subdomain, preference } = this.state;

    const data = {
      name: subdomain,
      target: mailserver,
      priority: +preference,
      type: 'MX',
    };

    const ids = [zone.id, id].filter(Boolean);
    return dispatch(dispatchOrStoreErrors.call(this, [
      () => domains.records[id ? 'put' : 'post'](data, ...ids),
      close,
    ]));
  }

  render() {
    const { close, title, id, zone } = this.props;
    const { errors, subdomain, preference, mailserver } = this.state;

    const analytics = { title, action: id ? 'edit' : 'add' };

    return (
      <FormModalBody
        onSubmit={this.onSubmit}
        onCancel={close}
        buttonText={id ? undefined : 'Add MX Record'}
        buttonDisabledText={id ? undefined : 'Adding MX Record'}
        analytics={analytics}
        errors={errors}
      >
        <div>
          <ModalFormGroup id="mailserver" label="Mail Server" apiKey="target" errors={errors}>
            <Input
              name="mailserver"
              value={mailserver}
              placeholder={`mx.${zone.domain}`}
              onChange={this.onChange}
            />
          </ModalFormGroup>
          <ModalFormGroup label="Preference" id="preference" apiKey="priority" errors={errors}>
            <Input
              id="preference"
              name="preference"
              value={preference}
              placeholder="10"
              type="number"
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
        </div>
      </FormModalBody>
    );
  }
}

EditMXRecord.propTypes = {
  dispatch: PropTypes.func.isRequired,
  zone: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  close: PropTypes.func.isRequired,
  id: PropTypes.number,
};
