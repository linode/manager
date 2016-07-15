import React, { Component, PropTypes } from 'react';
import generatePassword from 'password-generator';
import zxcvbn from 'zxcvbn';

export default class Details extends Component {
  constructor() {
    super();
    this.renderRow = this.renderRow.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onPasswordChange = this.onPasswordChange.bind(this);
    this.state = {
      password: '',
      strength: zxcvbn(''),
      label: '',
      enableBackups: false,
    };
  }

  onSubmit(e) {
    e.preventDefault();
    e.stopPropagation();

    this.props.onSubmit({
      password: this.state.password,
      label: this.state.label,
      enableBackups: this.state.enableBackups,
    });
  }

  onPasswordChange(e) {
    const password = e.target.value;
    const strength = zxcvbn(password);
    this.setState({ password, strength });
  }

  renderRow({ label, content, errors }) {
    return (
      <div className="row" key={label}>
        <div className="col-sm-2 label-col">{label}:</div>
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

    const labelInput = (
      <div className="input-container">
        <input
          value={this.state.label}
          onChange={e => this.setState({ label: e.target.value })}
          placeholder="my-label"
          className="form-control"
          name="label"
        />
      </div>
    );

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
        <div className="alert-danger">
          Write this password down. We won't display it again.
        </div>
      </div>
    );

    const inputRows = [
      { label: 'Label', content: labelInput, errors: errors.label },
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
          Enable ($2.50/month)
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
              disabled={!(this.props.submitEnabled && this.state.label && this.state.password)}
              className="btn btn-primary"
            >Create Linode</button>
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
