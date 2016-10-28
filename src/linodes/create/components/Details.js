import React, { Component, PropTypes } from 'react';
import _ from 'lodash';
import PasswordInput from '~/components/PasswordInput';

export default class Details extends Component {
  constructor() {
    super();
    this.renderRow = this.renderRow.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onLabelChange = this.onLabelChange.bind(this);
    this.onQuantityChange = this.onQuantityChange.bind(this);
    this.state = {
      password: '',
      quantity: 1,
      group: '',
      labels: [''],
      enableBackups: false,
      showAdvanced: false,
    };
  }

  onSubmit(e) {
    e.preventDefault();
    e.stopPropagation();

    this.props.onSubmit({
      password: this.state.password,
      labels: this.state.labels,
      group: this.state.group,
      backups: this.state.enableBackups,
    });
  }

  onLabelChange(v, i) {
    const labels = this.state.labels;
    labels[i] = v;
    this.setState({ labels });
  }

  onQuantityChange(v) {
    const { quantity } = this.state;
    let labels = this.state.labels;
    if (quantity > v) {
      labels = labels.slice(0, v);
    } else {
      while (labels.length < v) {
        labels.push(null);
      }
    }
    this.setState({ quantity: v, labels });
  }

  renderRow({ label, content, errors, key }) {
    return (
      <div className="form-group row" key={key || label}>
        <div className="col-sm-2 label-col">{label ? `${label}:` : null}</div>
        <div className="col-sm-10 content-col">
          {content}
          {errors ? (
            <div className="text-right">
              <div className="alert alert-danger">
                <ul>
                  {errors.map(e => <li key={e}>{e}</li>)}
                </ul>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  render() {
    const { errors } = this.props;

    const groupInput = (
      <div className="input-container">
        <input
          value={this.state.group}
          onChange={e => this.setState({ group: e.target.value })}
          placeholder="my-group (optional)"
          className="form-control"
          name="group"
        />
      </div>
    );
    const group = this.renderRow({ label: 'Group', content: groupInput });

    const labelInput = i => {
      const defaultLabel = this.state.labels[0] || 'my-label';
      return (<div className="input-container" key={`label-${i}`}>
        <input
          value={this.state.label}
          onChange={e => this.onLabelChange(e.target.value, i)}
          placeholder={this.state.labels[i] ?
            this.state.labels[i] : `${defaultLabel}${i !== 0 ? `-${i}` : ''}`}
          className="form-control"
          name="label"
        />
      </div>);
    };

    const passwordInput = (
      <div>
        <PasswordInput
          passwordType="offline_fast_hashing_1e10_per_second"
          onChange={password => this.setState({ password })}
        />
      </div>
    );

    const renderBackupsPrice = () => {
      const price = (this.props.selectedType.backups_price / 100).toFixed(2);
      return ` ($${price})`;
    };

    const backupInput = (
      <div className="checkbox">
        <label>
          <input
            type="checkbox"
            checked={this.state.enableBackups}
            onChange={e => this.setState({ enableBackups: e.target.checked })}
            name="enableBackups"
            disabled={this.props.selectedType === null}
          />
          <span>
            Enable
            {this.props.selectedType === null ? '' : renderBackupsPrice()}
          </span>
        </label>
      </div>
    );

    const inputRows = [
      ..._.range(this.state.quantity).map(i =>
        ({
          label: i === 0 ? 'Label' : null,
          content: labelInput(i),
          errors: errors.label,
          key: i,
        })),
      { label: 'Root password', content: passwordInput },
      { label: 'Backups', content: backupInput },
    ];

    const showAdvancedOrHide = this.state.showAdvanced ? (
      <span>Hide additional details <span className="fa fa-angle-up" /></span>
    ) : (
      <span>Show additional details <span className="fa fa-angle-down" /></span>
    );

    return (
      <div>
        <header>
          <h2>Details</h2>
        </header>
        <div className="card-body">
          <form onSubmit={this.onSubmit}>
            <section>
              {inputRows.map(this.renderRow)}
              <button
                className="btn btn-cancel"
                onClick={() => this.setState({ showAdvanced: !this.state.showAdvanced })}
              >{showAdvancedOrHide}</button>
              {!this.state.showAdvanced ? null : (
                <span>
                  {group}
                </span>
               )}
            </section>
            <section>
              <button
                type="submit"
                disabled={!(this.props.submitEnabled
                         && this.state.labels[0]
                         && this.state.password)}
                className="btn btn-primary"
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
  onSubmit: PropTypes.func,
  submitEnabled: PropTypes.bool,
  errors: PropTypes.object,
};

Details.defaultProps = {
  errors: {},
};
