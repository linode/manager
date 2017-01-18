import React, { Component, PropTypes } from 'react';

import { Card } from '~/components';
import { PrimaryButton } from '~/components/buttons';
import { Form, FormGroup, FormGroupError, PasswordInput, Input } from '~/components/form';
import { ErrorSummary } from '~/errors';

export default class Details extends Component {
  constructor() {
    super();
    this.state = {
      password: '',
      label: '',
      enableBackups: false,
      showAdvanced: false,
    };
  }

  onSubmit = () => {
    this.props.onSubmit({
      password: this.state.password,
      label: this.state.label,
      backups: this.state.enableBackups,
    });
  }

  render() {
    const { errors, selectedType, selectedDistribution, submitEnabled } = this.props;

    const renderBackupsPrice = () => {
      const price = (selectedType.backups_price / 100).toFixed(2);
      return `($${price}/mo)`;
    };

    const formDisabled = !(submitEnabled && this.state.label &&
    (this.state.password || selectedDistribution === 'none'));

    return (
      <Card title="Details">
        {/* TODO: Form should encapsulate all form fields on the create page */}
        <Form onSubmit={this.onSubmit}>
          <FormGroup name="label" errors={errors} className="row">
            <div className="col-sm-2 label-col">
              <label htmlFor="label">Label</label>
            </div>
            <div className="col-sm-10">
              <Input
                id="label"
                value={this.state.label}
                onChange={e => this.setState({ label: e.target.value })}
                placeholder={'gentoo-www1'}
              />
              <FormGroupError errors={errors} name="label" />
            </div>
          </FormGroup>
          <FormGroup name="root_pass" errors={errors} className="row">
            <div className="col-sm-2 label-col">
              <label htmlFor="password">Root password</label>
            </div>
            <div className="col-sm-10">
              <PasswordInput
                type="text"
                passwordType="offline_fast_hashing_1e10_per_second"
                onChange={password => this.setState({ password })}
              />
              <FormGroupError errors={errors} name="group" />
            </div>
          </FormGroup>
          <FormGroup name="backups" errors={errors} className="row">
            <div className="col-sm-2 label-col">
              <label htmlFor="backups">Enable backups</label>
            </div>
            <div className="col-sm-10">
              <input
                id="backups"
                type="checkbox"
                checked={this.state.enableBackups}
                onChange={e => this.setState({ enableBackups: e.target.checked })}
                disabled={selectedType === null}
              />
              <span className="EnabledBackupsPrice">
                {selectedType === null ? '' : renderBackupsPrice()}
              </span>
            </div>
          </FormGroup>
          <ErrorSummary errors={errors} />
          <FormGroup className="row">
            <div className="offset-sm-2 col-sm-10">
              <PrimaryButton
                type="submit"
                disabled={formDisabled}
                className="LinodesCreateDetails-create"
              >
                Create Linode{this.state.quantity > 1 ? 's' : null}
              </PrimaryButton>
            </div>
          </FormGroup>
        </Form>
      </Card>
    );
  }
}

Details.propTypes = {
  selectedType: PropTypes.object,
  selectedDistribution: PropTypes.string,
  onSubmit: PropTypes.func,
  submitEnabled: PropTypes.bool,
  errors: PropTypes.object,
};

Details.defaultProps = {
  errors: {},
};
