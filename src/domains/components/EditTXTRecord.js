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


export default class EditTXTRecord extends Component {
  constructor(props) {
    super();

    const { id, zone: { ttl_sec: defaultTTL, domain: zone } } = props;
    const {
      target: textvalue,
      name: textname,
      ttl_sec: ttl,
    } = props.zone._records.records[id] || {};

    this.state = {
      errors: {},
      loading: false,
      zone,
      defaultTTL,
      ttl,
      textvalue,
      textname,
    };
  }

  onSubmit = () => {
    const { dispatch, id, title, close } = this.props;
    const { ttl, textvalue, textname } = this.state;
    const ids = [this.props.zone.id, id].filter(Boolean);
    const data = {
      ttl_sec: +ttl,
      target: textvalue,
      // '' is the default and will track the zone
      name: textname === this.props.zone.domain ? '' : textname,
      type: 'TXT',
    };

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => domains.records[id ? 'put' : 'post'](data, ...ids),
      () => { EmitEvent('modal:submit', 'Modal', id ? 'edit' : 'add', title); },
      close,
    ]));
  }

  onChange = ({ target: { name, value } }) => this.setState({ [name]: value });

  render() {
    const { close, title } = this.props;
    const { errors, loading, defaultTTL, ttl, textvalue, textname } = this.state;
    return (
      <Form onSubmit={this.onSubmit}>
        <ModalFormGroup id="textname" label="Name" apiKey="name" errors={errors}>
          <Input
            id="textname"
            name="textname"
            value={textname}
            placeholder=""
            onChange={this.onChange}
          />
        </ModalFormGroup>
        <ModalFormGroup id="textvalue" label="Value" apiKey="target" errors={errors}>
          <Input
            id="textvalue"
            name="textvalue"
            value={textvalue}
            placeholder=""
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
            disabledChildren={!this.props.id && 'Adding TXT Record' || undefined}
          >
            {!this.props.id && 'Add TXT Record' || undefined}
          </SubmitButton>
          <FormSummary errors={errors} />
        </div>
      </Form>
    );
  }
}

EditTXTRecord.propTypes = {
  dispatch: PropTypes.func.isRequired,
  zone: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  close: PropTypes.func.isRequired,
  id: PropTypes.number,
};
