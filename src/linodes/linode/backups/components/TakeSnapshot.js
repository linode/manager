import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { push } from 'react-router-redux';

import ModalFormGroup from 'linode-components/dist/forms/ModalFormGroup';
import Input from 'linode-components/dist/forms/Input';
import { onChange } from 'linode-components/dist/forms/utilities';
import FormModalBody from 'linode-components/dist/modals/FormModalBody';

import { showModal } from '~/actions/modal';
import { takeBackup } from '~/api/ad-hoc/backups';
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
    const { dispatch, linode, close } = this.props;
    const { label } = this.state;

    dispatch(dispatchOrStoreErrors.call(this, [
      () => takeBackup(linode.id, label),
      ({ id }) => push(`/linodes/${linode.label}/backups/${id}`),
    ]));

    close();
  }

  render() {
    const { close } = this.props;
    const { errors, label } = this.state;

    return (
      <FormModalBody
        onCancel={close}
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
  close: PropTypes.func.isRequired,
};
