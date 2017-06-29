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
import { EmitEvent } from 'linode-components/utils';

import SelectDNSSeconds from './SelectDNSSeconds';

export default class EditCNAMERecord extends Component {
  constructor(props) {
    super();

    const { id, zone: { ttl_sec: defaultTTL, domain: zone } } = props;
    const {
      target: alias,
      name: hostname,
      ttl_sec: ttl,
    } = props.zone._records.records[id] || {};

    this.state = {
      errors: {},
      loading: false,
      zone,
      defaultTTL,
      ttl,
      hostname,
      alias,
    };
  }

  onSubmit = () => {
    const { dispatch, id, title, close } = this.props;
    const { ttl, hostname, alias } = this.state;
    const ids = [this.props.zone.id, id].filter(Boolean);
    const data = {
      ttl_sec: +ttl,
      name: hostname,
      target: alias,
      type: 'CNAME',
    };

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => domains.records[id ? 'put' : 'post'](data, ...ids),
      () => { EmitEvent('modal:submit', 'Modal', id ? 'edit' : 'add', title); },
      close,
    ]));
  }

  onChange = ({ target: { name, value } }) => this.setState({ [name]: value })

  render() {
    const { close, title } = this.props;
    const { errors, loading, defaultTTL, ttl, hostname, alias } = this.state;

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
          <CancelButton
            onClick={() => {
              EmitEvent('modal:cancel', 'Modal', 'cancel', title);
              close();
            }}
          />
          <SubmitButton
            disabled={loading}
            disabledChildren={this.props.id ? undefined : 'Adding CNAME Record'}
          >
            {this.props.id ? undefined : 'Add CNAME Record'}
          </SubmitButton>
          <FormSummary errors={errors} />
        </div>
      </Form>
    );
  }
}

EditCNAMERecord.propTypes = {
  dispatch: PropTypes.func.isRequired,
  zone: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  close: PropTypes.func.isRequired,
  id: PropTypes.number,
};
