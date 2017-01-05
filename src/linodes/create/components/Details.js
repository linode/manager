import React, { Component, PropTypes } from 'react';

import PasswordInput from '~/components/PasswordInput';
import FormRow from '~/components/FormRow';

export default class Details extends Component {
  constructor() {
    super();
    this.onSubmit = this.onSubmit.bind(this);
    this.state = {
      password: '',
      label: '',
      enableBackups: false,
      showAdvanced: false,
    };
  }

  onSubmit(e) {
    e.preventDefault();
    e.stopPropagation();

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
      <div className="LinodesCreateDetails">
        <header className="LinodesCreateDetails-header">
          <h2 className="LinodesCreateDetails-title">Details</h2>
        </header>
        <div className="LinodesCreateDetails-body">
          <form onSubmit={this.onSubmit}>
            <section>
              <FormRow label="Label" errors={errors.label}>
                <div className="LinodesCreateDetails-label">
                  <input
                    value={this.state.label}
                    onChange={e => this.setState({ label: e.target.value })}
                    placeholder={'gentoo-www1'}
                    className="form-control"
                  />
                </div>
              </FormRow>
              <FormRow
                label="Root password"
                errors={errors.root_password}
                showIf={selectedDistribution !== 'none'}
              >
                <div className="LinodesCreateDetails-password">
                  <PasswordInput
                    passwordType="offline_fast_hashing_1e10_per_second"
                    onChange={password => this.setState({ password })}
                  />
                </div>
              </FormRow>
              <FormRow
                label="Enable backups"
                errors={errors.backups}
                showIf={selectedDistribution !== 'none'}
              >
                <div className="LinodesCreateDetails-enableBackups">
                  <label>
                    <input
                      type="checkbox"
                      checked={this.state.enableBackups}
                      onChange={e => this.setState({ enableBackups: e.target.checked })}
                      disabled={selectedType === null}
                    />
                    <span>
                      {selectedType === null ? '' : renderBackupsPrice()}
                    </span>
                  </label>
                </div>
              </FormRow>
            </section>
            {errors.__form ?
              <section>
                <div>
                  <div className="alert alert-danger">
                    {errors.__form}
                  </div>
                </div>
              </section> : null}
            <section>
              <button
                disabled={formDisabled}
                className="LinodesCreateDetails-create"
              >Create Linode{this.state.quantity > 1 ? 's' : null}</button>
            </section>
          </form>
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
