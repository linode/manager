import React, { Component, PropTypes } from 'react';
import _ from 'lodash';
import PasswordInput from '~/components/PasswordInput';

function renderRow({ label, content, errors, key }) {
  return (
    <div className="form-group row" key={key || label}>
      <div className="col-sm-2 label-col">{label ? `${label}:` : null}</div>
      <div className="col-sm-10 content-col">
        {content}
        {!errors ? null :
          <div className="text-right">
            <div className="alert alert-danger">
              <ul>
                {errors.map(e => <li key={e}>{e}</li>)}
              </ul>
            </div>
          </div>
        }
      </div>
    </div>
  );
}

renderRow.propTypes = {
  label: PropTypes.string.isRequired,
  content: PropTypes.object.isRequired,
  errors: PropTypes.object,
  key: PropTypes.any,
};

export default class Details extends Component {
  constructor() {
    super();
    this.onSubmit = this.onSubmit.bind(this);
    this.onLabelChange = this.onLabelChange.bind(this);
    this.onQuantityChange = this.onQuantityChange.bind(this);
    this.state = {
      password: '',
      quantity: 1,
      group: '',
      labels: [''],
      enableBackups: false,
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

  render() {
    const { errors } = this.props;

    const quantityInput = (
      <div className="input-container">
        <input
          type="number"
          min="1"
          max="15"
          step="1"
          value={this.state.quantity}
          onChange={e => this.onQuantityChange(
            Math.min(Math.max(e.target.value, 1), 15)
          )}
          className="form-control"
          name="quantity"
        />
      </div>
    );

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

    const defaultLabel = this.state.labels[0] || 'my-label';
    const defaultPlaceholder = i => `${defaultLabel}${i !== 0 ? `-${i}` : ''}`;
    const labelInput = i => (
      <div className="input-container" key={`label-${i}`}>
        <input
          value={this.state.label}
          onChange={e => this.onLabelChange(e.target.value, i)}
          placeholder={this.state.labels[i] ? this.state.labels[i] : defaultPlaceholder(i)}
          className="form-control"
          name="label"
        />
      </div>
    );

    const passwordInput = (
      <div>
        <PasswordInput
          passwordType="offline_fast_hashing_1e10_per_second"
          onChange={password => this.setState({ password })}
        />
        <div className="alert alert-info">
          Save this password somewhere safe. We can&apos;t display it again.
        </div>
      </div>
    );

    const inputRows = [
      { label: 'Quantity', content: quantityInput },
      { label: 'Group', content: groupInput, errors: errors.group },
      ..._.range(this.state.quantity).map(i =>
        ({
          label: i === 0 ? 'Label' : null,
          content: labelInput(i),
          errors: errors.label,
          key: i,
        })),
      { label: 'Root password', content: passwordInput },
    ];

    const renderBackupsPrice = () => {
      const price = (this.props.selectedType.backups_price / 100).toFixed(2);
      return ` ($${price})`;
    };

    const backupInput = (
      <div className="checkbox">
        <label htmlFor="enable-backups">
          <input
            type="checkbox"
            checked={this.state.enableBackups}
            onChange={e => this.setState({ enableBackups: e.target.checked })}
            name="enableBackups"
            id="enable-backups"
            disabled={this.props.selectedType === null}
          />
          <span>
            Enable
            {this.props.selectedType === null ? '' : renderBackupsPrice()}
          </span>
        </label>
      </div>
    );
    const backups = renderRow({ label: 'Backups', content: backupInput });

    return (
      <div>
        <header>
          <h2>Details</h2>
        </header>
        <div className="card-body">
          <form onSubmit={this.onSubmit}>
            <section>
              {inputRows.map(renderRow)}
              {backups}
            </section>
            <button
              type="submit"
              disabled={!(this.props.submitEnabled
                && this.state.labels[0]
                && this.state.password)}
              className="btn btn-primary"
            >Create Linode{this.state.quantity > 1 ? 's' : null}</button>
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
