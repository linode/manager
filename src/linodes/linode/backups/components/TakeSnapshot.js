import React, { Component, PropTypes } from 'react';
import { push } from 'react-router-redux';

import { ModalFormGroup, Input } from 'linode-components/forms';
import { onChange } from 'linode-components/forms/utilities';
import { FormModalBody } from 'linode-components/modals';

import { showModal, hideModal } from '~/actions/modal';
import { takeBackup } from '~/api/backups';
import { dispatchOrStoreErrors } from '~/api/util';


export default class TakeSnapshot extends Component {
  static title = 'Take New Snapshot'

  static trigger(dispatch, linode) {
    return dispatch(showModal(TakeSnapshot.title, (
      <TakeSnapshot
        dispatch={dispatch}
        linode={linode}
      />
    )));
  }

  constructor() {
    super();

    this.state = {
      errors: {},
      label: '',
    };

    this.onChange = onChange.bind(this);
  }

  onSubmit = () => {
    const { dispatch, linode } = this.props;
    const { label } = this.state;

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => takeBackup(linode.id, label),
      ({ id }) => push(`/linodes/${linode.label}/backups/${id}`),
    ]));
  }

  render() {
    const { dispatch } = this.props;
    const { errors, label } = this.state;

    return (
      <FormModalBody
        onCancel={() => dispatch(hideModal())}
        onSubmit={this.onSubmit}
        buttonText="Take Snapshot"
        buttonDisabledText="Taking Snapshot"
        analytics={{ title: TakeSnapshot.title }}
        errors={errors}
      >
        <div>
          <ModalFormGroup id="label" label="Label" apiKey="label" errors={errors}>
            <Input
              id="label"
              name="label"
              value={label}
              onChange={this.onChange}
            />
          </ModalFormGroup>
        </div>
      </FormModalBody>
    );
  }
}

TakeSnapshot.propTypes = {
  dispatch: PropTypes.func.isRequired,
  linode: PropTypes.object.isRequired,
};
