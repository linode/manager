import React, { Component, PropTypes } from 'react';

import Input from '~/components/Input';

export default class PasswordInput extends Component {
  constructor() {
    super();
    this.onPasswordChange = this.onPasswordChange.bind(this);
    this.state = {
      password: '',
      // eslint-disable-next-line no-undef
      strength: zxcvbn(''),
      type: 'password',
    };
  }

  onPasswordChange(e) {
    const { onChange } = this.props;
    const password = e.target.value;
    // eslint-disable-next-line no-undef
    const strength = zxcvbn(password);
    this.setState({ password, strength });
    onChange(password);
  }

  render() {
    const { passwordType } = this.props;
    return (
      <div className="PasswordInput">
        <Input
          value={this.state.password}
          placeholder="**********"
          className="PasswordInput-input"
          onChange={this.onPasswordChange}
          autoComplete="off"
          type="password"
        />
        <div
          className={`PasswordInput-strength PasswordInput-strength--${this.state.strength.score}`}
        >
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
    );
  }
}

PasswordInput.propTypes = {
  onChange: PropTypes.func.isRequired,
  passwordType: PropTypes.string,
};
