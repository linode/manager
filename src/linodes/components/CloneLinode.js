import React, { PropTypes, Component } from 'react';
import { push } from 'react-router-redux';

import { ModalFormGroup } from 'linode-components/forms';
import { onChange } from 'linode-components/forms/utilities';
import { FormModalBody } from 'linode-components/modals';

import { hideModal, showModal } from '~/actions/modal';
import { cloneLinode } from '~/api/linodes';
import { dispatchOrStoreErrors } from '~/api/util';

import LinodeSelect from './LinodeSelect';
import PlanSelect from './PlanSelect';
import { RegionSelect } from '../../components';


export default class CloneLinode extends Component {
  static title = 'Clone a Linode'

  static trigger(dispatch, linodes, plans) {
    return dispatch(showModal(CloneLinode.title, (
      <CloneLinode
        dispatch={dispatch}
        close={() => dispatch(hideModal())}
        linodes={linodes}
        plans={plans}
      />
    )));
  }

  constructor(props) {
    super(props);

    this.state = { errors: {} };

    this.onChange = onChange.bind(this);
  }

  onSubmit = () => {
    const { dispatch } = this.props;
    const { linode, region, plan } = this.state;

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => cloneLinode(linode, region, plan),
      ({ label }) => push(`/linodes/${label}`),
    ]));
  }

  render() {
    const { close, plans, linodes } = this.props;
    const { errors, region, plan, linode } = this.state;

    return (
      <FormModalBody
        onSubmit={this.onSubmit}
        onCancel={close}
        buttonText="Clone Linode"
        buttonDisabledText="Cloning Linode"
        analytics={{ title: CloneLinode.title, action: 'add' }}
        errors={errors}
      >
        <div>
          <h3>Clone from (existing Linode)</h3>
          <ModalFormGroup label="Linode" id="linode" apiKey="linode" errors={errors}>
            <LinodeSelect
              linodes={linodes}
              value={linode}
              name="linode"
              id="linode"
              onChange={this.onChange}
              allowNone
            />
          </ModalFormGroup>
          <h3>Clone to (new Linode)</h3>
          <ModalFormGroup label="Region" id="region" apiKey="region" errors={errors}>
            <RegionSelect
              value={region}
              name="region"
              id="region"
              onChange={this.onChange}
            />
          </ModalFormGroup>
          <ModalFormGroup label="Plan" id="plan" apiKey="plan" errors={errors}>
            <PlanSelect
              plans={plans}
              value={plan}
              name="plan"
              id="plan"
              onChange={this.onChange}
            />
          </ModalFormGroup>
        </div>
      </FormModalBody>
    );
  }
}

CloneLinode.propTypes = {
  dispatch: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired,
  linodes: PropTypes.object.isRequired,
  plans: PropTypes.object.isRequired,
};
