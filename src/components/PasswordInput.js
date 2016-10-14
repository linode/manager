import React, { Component, PropTypes } from 'react';
import generatePassword from 'password-generator';
import zxcvbn from 'zxcvbn';

export default class PasswordInput extends Component {
  constructor() {
    super();
    this.onPasswordChange = this.onPasswordChange.bind(this);
    this.state = {
      password: '',
      strength: zxcvbn(''),
      type: 'password',
    };
  }

  onPasswordChange(e) {
    const { onChange } = this.props;
    const password = e.target.value;
    const strength = zxcvbn(password);
    this.setState({ password, strength });
    onChange(password);
  }

  render() {
    const { passwordType } = this.props;
    return (
      <div className="input-container input-group password-input">
        <input
          value={this.state.password}
          placeholder="Choose a strong password"
          className="form-control"
          name="password"
          onChange={this.onPasswordChange}
          autoComplete="off"
          type={this.state.type}
        />
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => {
            this.onPasswordChange({ target: { value: generatePassword(30, false) } });
            this.setState({ type: 'text' });
          }}
        >Generate</button>
        <div className="form-group">
          <div className={`strength strength-${this.state.strength.score}`}>
            <span />
            <span />
            <span />
            <span />
          </div>
        </div>
        {this.state.password !== '' ? <p>
          An offline attack would
          take {this.state.strength.crack_times_display[passwordType]} to
          crack this password.<br />
        </p> : null}
      </div>
    );
  }
}

PasswordInput.propTypes = {
  onChange: PropTypes.func.isRequired,
  passwordType: PropTypes.string,
};
