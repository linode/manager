import React, { Component, PropTypes } from 'react';

import PasswordInput from '~/components/PasswordInput';
import Input from '~/components/Input';
import Checkbox from '~/components/Checkbox';
import { Form, FormGroup, FormGroupError, SubmitButton } from '~/components/form';
import { ErrorSummary } from '~/errors';

const CLASS_NAME = 'LinodeCreateDetails';

export default class Details extends Component {
  constructor() {
    super();
    this.onSubmit = this.onSubmit.bind(this);
    this.state = {
      password: '',
      label: '',
      enableBackups: false,
      showAdvanced: false,
      loading: false,
    };
  }

  onSubmit() {
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
      <div className={CLASS_NAME}>
        <header>
          <h2>Details</h2>
        </header>
        <div>
          <Form onSubmit={this.onSubmit}>
            <FormGroup errors={errors} name="label" className="row">
              <div className="col-sm-2 label-col">
                <label>Label:</label>
              </div>
              <div className="col-sm-10 content-col">
                <div className={`${CLASS_NAME}-label`}>
                  <Input
                    value={this.state.label}
                    onChange={e => this.setState({ label: e.target.value })}
                    placeholder="gentoo-www1"
                  />
                </div>
                <FormGroupError errors={errors} name="label" />
              </div>
            </FormGroup>
            <FormGroup errors={errors} name="root_pass" className="row">
              <div className="col-sm-2 label-col">
                <label>Root password:</label>
              </div>
              <div className="col-sm-10 content-col">
                <PasswordInput
                  passwordType="offline_fast_hashing_1e10_per_second"
                  onChange={password => this.setState({ password })}
                />
                <FormGroupError errors={errors} name="root_pass" />
              </div>
            </FormGroup>
            <div className="form-group row">
              <div className="col-sm-2 label-col">
                <label>Enable backups:</label>
              </div>
              <div className="col-sm-10 content-col">
                <Checkbox
                  className={`${CLASS_NAME}-enableBackups`}
                  checked={this.state.enableBackups}
                  onChange={e => this.setState({ enableBackups: e.target.checked })}
                  disabled={selectedType === null}
                  label={selectedType === null ? '' : renderBackupsPrice()}
                />
              </div>
            </div>
            <div className="form-group row">
              <div className="col-sm-10 offset-sm-2">
                <SubmitButton
                  disabled={formDisabled}
                >Create Linode</SubmitButton>
              </div>
            </div>
            <ErrorSummary errors={errors} />
          </Form>
        </div>
      </div>
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
