import React, { Component, PropTypes } from 'react';

import { Card } from '~/components';
import { Form, FormGroup, SubmitButton } from '~/components/form';
import PasswordInput from '~/components/PasswordInput';

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
          <FormGroup name="label" errors={errors.label} className="row">
            <label className="col-sm-2" htmlFor="label">Label</label>
            <div className="col-sm-10">
              <input
                id="label"
                name="label"
                type="text"
                value={this.state.label}
                onChange={e => this.setState({ label: e.target.value })}
                placeholder={'gentoo-www1'}
                className="form-control"
              />
            </div>
          </FormGroup>
          <FormGroup
            name="password"
            errors={errors.root_password}
            className={`row ${selectedDistribution === 'none' ? 'hidden' : ''}`}
          >
            <label htmlFor="password" className="col-sm-2">Root Password</label>
            <div className="col-sm-10">
              <PasswordInput
                type="text"
                passwordType="offline_fast_hashing_1e10_per_second"
                onChange={password => this.setState({ password })}
              />
            </div>
          </FormGroup>
          <FormGroup
            name="enabled_backups"
            errors={errors.backups}
            className={`row ${selectedDistribution === 'none' ? 'hidden' : ''}`}
          >
            <label htmlFor="enabled_backups" className="col-sm-2">Enable Backups</label>
            <div className="col-sm-10">
              <input
                id="enabled_backups"
                type="checkbox"
                checked={this.state.enableBackups}
                onChange={e => this.setState({ enableBackups: e.target.checked })}
                disabled={selectedType === null}
              />
              <span>
                {selectedType === null ? '' : renderBackupsPrice()}
              </span>
            </div>
          </FormGroup>
          {errors.__form ?
            <div>
              <div className="alert alert-danger">
                {errors.__form}
              </div>
            </div> : null}
          <FormGroup className="row">
            <div className="offset-sm-2 col-sm-10">
              <SubmitButton className="btn-primary" disabled={formDisabled}>
                Create Linode{this.state.quantity > 1 ? 's' : null}
              </SubmitButton>
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
