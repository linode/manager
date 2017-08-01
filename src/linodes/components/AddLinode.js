import React, { PropTypes, Component } from 'react';

import { ExternalLink } from 'linode-components/buttons';
import { Checkbox, Input, ModalFormGroup, PasswordInput } from 'linode-components/forms';
import { onChange } from 'linode-components/forms/utilities';
import { FormModalBody } from 'linode-components/modals';

import { hideModal, showModal } from '~/actions/modal';
import { linodes } from '~/api';
import { dispatchOrStoreErrors } from '~/api/util';

import DistributionSelect from './DistributionSelect';
import RegionSelect from './RegionSelect';
import PlanSelect from './PlanSelect';


export default class AddLinode extends Component {
  static title = 'Add a Linode'

  static trigger(dispatch, distributions, plans) {
    return dispatch(showModal(AddLinode.title, (
      <AddLinode
        dispatch={dispatch}
        close={() => dispatch(hideModal())}
        distributions={distributions}
        plans={plans}
      />
    )));
  }

  constructor(props) {
    super(props);

    this.state = { errors: {}, password: '' };

    this.onChange = onChange.bind(this);
  }

  onSubmit = () => {
    const { dispatch, close } = this.props;
    const { label, distribution, region, plan, backups, password } = this.state;

    const data = {
      label,
      distribution,
      region,
      type: plan,
      backups_enabled: backups,
      root_pass: password,
    };

    if (distribution === 'none') {
      delete data.root_pass;
      delete data.distribution;
    }

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => linodes.post(data),
      close,
    ]));
  }

  render() {
    const { close, distributions, plans } = this.props;
    const { errors, label, distribution, region, plan, backups, password } = this.state;

    let backupsLabel = 'Enable';
    if (plan) {
      const backupsPrice = plans[plan].backups_price.toFixed(2);
      backupsLabel = `Enable ($${backupsPrice}/mo)`;
    }

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
              placeholder="my-linode"
              value={label}
              name="label"
              id="label"
              onChange={this.onChange}
            />
          </ModalFormGroup>
          <ModalFormGroup label="Distribution" id="distribution" apiKey="distribution">
            <DistributionSelect
              distributions={distributions}
              value={distribution}
              name="distribution"
              id="distribution"
              onChange={this.onChange}
              allowNone
            />
            <small className="text-muted">
              <ExternalLink to="https://linode.com/distributions">Learn more</ExternalLink>
            </small>
          </ModalFormGroup>
          <ModalFormGroup label="Region" id="region" apiKey="region">
            <RegionSelect
              value={region}
              name="region"
              id="region"
              onChange={this.onChange}
            />
            <small className="text-muted">
              <ExternalLink to="https://www.linode.com/speedtest">Learn more</ExternalLink>
            </small>
          </ModalFormGroup>
          <ModalFormGroup label="Plan" id="plan" apiKey="plan">
            <PlanSelect
              plans={plans}
              value={plan}
              name="plan"
              id="plan"
              onChange={this.onChange}
            />
            <small className="text-muted">
              <ExternalLink to="https://linode.com/pricing">Learn more</ExternalLink>
            </small>
          </ModalFormGroup>
          <ModalFormGroup label="Password" id="password" apiKey="root_pass">
            <PasswordInput
              value={password}
              name="password"
              id="password"
              onChange={this.onChange}
              disabled={distribution === 'none'}
            />
          </ModalFormGroup>
          <ModalFormGroup label="Backups" id="backups" apiKey="backups">
            <Checkbox
              value={backups}
              checked={backups}
              label={backupsLabel}
              name="backups"
              id="backups"
              onChange={this.onChange}
            />
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
  plans: PropTypes.object.isRequired,
};
