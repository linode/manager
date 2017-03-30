import React, { Component, PropTypes } from 'react';

import { Card, CardHeader } from '~/components/cards';
import { PrimaryButton } from '~/components/buttons';
import { Form, FormGroup, FormGroupError, PasswordInput, Input, Checkbox } from '~/components/form';
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
      if (!selectedType) {
        return '(Select a plan to view the price of backups)';
      }

      const price = (selectedType.backups_price / 100).toFixed(2);
      return `($${price}/mo)`;
    };

    return (
      <Card header={<CardHeader title="Details" />}>
        {/* TODO: Form should encapsulate all form fields on the create page */}
        <Form onSubmit={this.onSubmit}>
          <FormGroup name="label" errors={errors} className="row">
            <label htmlFor="label" className="col-sm-2 col-form-label">Label</label>
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
            <label htmlFor="password" className="col-sm-2 col-form-label">Root password</label>
            <div className="col-sm-10">
              <PasswordInput
                type="text"
                passwordType="offline_fast_hashing_1e10_per_second"
                onChange={password => this.setState({ password })}
                disabled={selectedDistribution === 'none'}
              />
              <FormGroupError errors={errors} name="root_pass" inline={false} />
            </div>
          </FormGroup>
          <FormGroup name="backups" errors={errors} className="row">
            <label htmlFor="backups" className="col-sm-2 col-form-label">Enable backups</label>
            <div className="col-sm-10">
              <Checkbox
                id="backups"
                checked={this.state.enableBackups}
                onChange={e => this.setState({ enableBackups: e.target.checked })}
                label={renderBackupsPrice()}
              />
            </div>
          </FormGroup>
          <ErrorSummary errors={errors} />
          <FormGroup className="row">
            <div className="offset-sm-2 col-sm-10">
              <PrimaryButton
                type="submit"
                disabled={!submitEnabled}
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
