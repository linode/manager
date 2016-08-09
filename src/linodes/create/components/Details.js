import React, { Component, PropTypes } from 'react';
import generatePassword from 'password-generator';
import zxcvbn from 'zxcvbn';
import _ from 'lodash';

export default class Details extends Component {
  constructor() {
    super();
    this.renderRow = this.renderRow.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onPasswordChange = this.onPasswordChange.bind(this);
    this.onLabelChange = this.onLabelChange.bind(this);
    this.onQuantityChange = this.onQuantityChange.bind(this);
    this.state = {
      password: '',
      strength: zxcvbn(''),
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

  onPasswordChange(e) {
    const password = e.target.value;
    const strength = zxcvbn(password);
    this.setState({ password, strength });
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
      <div className="row" key={key || label}>
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
      <div className="input-container input-group password-input">
        <input
          value={this.state.password}
          placeholder="Choose a strong password"
          className="form-control"
          name="password"
          onChange={this.onPasswordChange}
          autoComplete="off"
        />
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() =>
            this.onPasswordChange({ target: { value: generatePassword(30, false) } })}
        >Generate</button>
        <div className={`strength strength-${this.state.strength.score}`}>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>
        {this.state.password !== '' ? <p>
          We estimate that an offline attack on this password would
          take {this.state.strength.crack_times_display.offline_fast_hashing_1e10_per_second} to
          crack.<br />
        </p> : null}
        <div className="alert alert-info">
          Write this password down. We won't display it again.
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

    const backupInput = (
      <div className="checkbox">
        <label>
          <input
            type="checkbox"
            value={this.state.enableBackups}
            onChange={e => this.setState({ enableBackups: e.target.value })}
            name="enableBackups"
          />
          <span>Enable ($2.50/month)</span>
        </label>
      </div>
    );
    const backups = this.renderRow({ label: 'Backups', content: backupInput });

    return (
      <div>
        <header>
          <h2>Details</h2>
        </header>
        <div className="card-body">
          <form onSubmit={this.onSubmit}>
            <section>
              {inputRows.map(this.renderRow)}
            </section>
            <hr />
            {backups}
            <hr />
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
  onSubmit: PropTypes.func,
  submitEnabled: PropTypes.bool,
  errors: PropTypes.object,
};

Details.defaultProps = {
  errors: {},
};
