import React, { PropTypes, Component } from 'react';

import { Input, ModalFormGroup } from 'linode-components/forms';
import { FormModalBody } from 'linode-components/modals';

import { domains } from '~/api';
import { dispatchOrStoreErrors } from '~/api/util';

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
      zone,
      defaultTTL,
      ttl,
      textvalue,
      textname,
    };
  }

  onSubmit = () => {
    const { dispatch, id, close } = this.props;
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
      close,
    ]));
  }

  onChange = ({ target: { name, value } }) => this.setState({ [name]: value });

  render() {
    const { close, title, id } = this.props;
    const { errors, defaultTTL, ttl, textvalue, textname } = this.state;

    const analytics = { title, action: id ? 'edit' : 'add' };

    return (
      <FormModalBody
        onSubmit={this.onSubmit}
        onCancel={close}
        buttonText={id ? undefined : 'Add TXT Record'}
        buttonDisabledText={id ? undefined : 'Adding TXT Record'}
        analytics={analytics}
        errors={errors}
      >
        <div>
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
        </div>
      </FormModalBody>
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
