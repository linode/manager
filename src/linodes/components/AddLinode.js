import React, { PropTypes, Component } from 'react';
import { Link } from 'react-router';

import { Input, ModalFormGroup } from 'linode-components/forms';
import { onChange } from 'linode-components/forms/utilities';
import { FormModalBody } from 'linode-components/modals';

import { hideModal, showModal } from '~/actions/modal';
import { dispatchOrStoreErrors } from '~/api';

import DistributionSelect from './DistributionSelect';


export default class AddLinode extends Component {
  static title = 'Add a Linode'

  static trigger(dispatch, distributions, plans, regions) {
    return dispatch(showModal(AddLinode.title, (
      <AddLinode
        dispatch={dispatch}
        close={() => dispatch(hideModal())}
        distributions={distributions}
        plans={plans}
        regions={regions}
      />
    )));
  }

  constructor(props) {
    super(props);

    this.state = { errors: {} };

    this.onChange = onChange.bind(this);
  }

  render() {
    const { close, distributions, regions, plans } = this.props;
    const { errors, label, distribution, region, plan, backups } = this.state;

    return (
      <FormModalBody
        onSubmit={this.onSubmit}
        onCancel={close}
        buttonText="Add Linode"
        buttonDisabledText="Adding Linode"
        analytics={{ title: AddLinode.title, action: 'add' }}
        errors={errors}
      >
        <div>
          <ModalFormGroup label="Label" id="label" apiKey="label">
            <Input
              value={label}
              name="label"
              id="label"
              onChange={this.onChange}
            />
          </ModalFormGroup>
          <ModalFormGroup label="Distribution" id="distribution" apiKey="distribution">
            <DistributionSelect
              distributions={distributions}
              value={this.distribution}
              name="distribution"
              id="distribution"
              onChange={this.onChange}
            />
          </ModalFormGroup>
          <ModalFormGroup label="Region" id="region" apiKey="region">
            <Input />
          </ModalFormGroup>
          <ModalFormGroup label="Plan" id="plan" apiKey="plan">
            <Input />
          </ModalFormGroup>
          <ModalFormGroup label="Backups" id="backups" apiKey="backups">
            <Input />
          </ModalFormGroup>
        </div>
      </FormModalBody>
    );
  }
}

AddLinode.propTypes = {
  dispatch: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired,
  distributions: PropTypes.object.isRequired,
  regions: PropTypes.object.isRequired,
  plans: PropTypes.object.isRequired,
};

