import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Input, Select, ModalFormGroup } from 'linode-components/forms';
import { onChange } from 'linode-components/forms/utilities';
import { FormModalBody } from 'linode-components/modals';

import api from '~/api';
import { dispatchOrStoreErrors } from '~/api/util';

const tagOptions = [
    { value: 'issue', label: 'issue', index: 0 },
    { value: 'issuewild', label: 'issueWild', index: 1 },
    { value: 'iodef', label: 'iodef', index: 2 },
];

export default class EditCAARecord extends Component {
  constructor(props) {
    super();

    const { id } = props;
    const {
      tag,
      target,
    } = props.zone._records.records[id] || {};

    this.state = {
      errors: {},
      tag: tag || tagOptions[0].value,
      target: target || '',
    };

    this.onChange = onChange.bind(this);
  }

  onSubmit = () => {
    const { dispatch, id, close } = this.props;
    const { tag, target } = this.state;
    const ids = [this.props.zone.id, id].filter(Boolean);
    const data = {
      tag,
      target,
      type: 'CAA',
    };

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => api.domains.records[id ? 'put' : 'post'](data, ...ids),
      close,
    ]));
  }

  render() {
    const { close, title, id } = this.props;
    const {
      errors,
      tag,
      target,
    } = this.state;

    const analytics = { title, action: id ? 'edit' : 'add' };

    return (
      <FormModalBody
        onSubmit={this.onSubmit}
        onCancel={close}
        buttonText={id ? undefined : 'Add CAA Record'}
        buttonDisabledText={id ? undefined : 'Adding CAA Record'}
        analytics={analytics}
        errors={errors}
      >
        <div>
          <ModalFormGroup id="tag" label="Tag" apiKey="tag" errors={errors}>
            <Select
              value={tag}
              onChange={this.onChange}
              id="tag"
              name="tag"
              options={tagOptions}
            />
          </ModalFormGroup>
          <ModalFormGroup id="target" label="Value" apiKey="target" errors={errors}>
            <Input
              id="target"
              name="target"
              value={target}
              onChange={this.onChange}
            />
          </ModalFormGroup>
        </div>
      </FormModalBody>
    );
  }
}

EditCAARecord.propTypes = {
  dispatch: PropTypes.func.isRequired,
  zone: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  close: PropTypes.func.isRequired,
  id: PropTypes.number,
};
