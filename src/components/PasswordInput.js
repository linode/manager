import React, { Component, PropTypes } from 'react';
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
          placeholder="**********"
          className="form-control PasswordInput-input"
          name="password"
          onChange={this.onPasswordChange}
          autoComplete="off"
          type={this.state.type}
        />
        <br />
        <div className="form-group">
          <div className={`PasswordInput-strength strength strength-${this.state.strength.score}`}>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
          {this.state.password !== '' ? <div className="PasswordInput-cracktime">
            An offline attack would
            take {this.state.strength.crack_times_display[passwordType]} to
            crack this password.<br />
          </div> : null}
        </div>
      </div>
    );
  }
}

PasswordInput.propTypes = {
  onChange: PropTypes.func.isRequired,
  passwordType: PropTypes.string,
};
