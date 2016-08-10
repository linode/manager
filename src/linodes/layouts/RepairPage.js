import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { getLinode } from './LinodeDetailPage';
import PasswordInput from '~/components/PasswordInput';
import HelpButton from '~/components/HelpButton';

export class RepairPage extends Component {
  constructor() {
    super();
    this.getLinode = getLinode.bind(this);
    this.renderRescueMode = this.renderRescueMode.bind(this);
    this.renderResetRootPassword = this.renderResetRootPassword.bind(this);
    this.state = { password: '' };
  }

  renderRescueMode() {
    return (
      <div className="col-xl-6">
        <h2>
          Rescue mode
          <HelpButton to="http://example.org" />
        </h2>
        <p>TODO</p>
      </div>
    );
  }

  renderResetRootPassword() {
    return (
      <div className="col-xl-6">
        <h2>
          Reset root password
          <HelpButton to="http://example.org" />
        </h2>
        <PasswordInput
          passwordType="offline_fast_hashing_1e10_per_second"
          onChange={password => this.setState({ password })}
        />
        <p>
          <span className="text-danger">Warning!</span> Your Linode
          will be shut down during this process.
        </p>
        <button
          className="btn btn-danger"
          disabled={!this.state.password}
        >Reset Password</button>
      </div>
    );
  }

  renderRebuild() {
    return (
      <div className="col-xl-6">
        <h2>
          Rebuild
          <HelpButton to="http://example.org" />
        </h2>
        <p>TODO</p>
      </div>
    );
  }

  render() {
    return (
      <div>
        <div className="row">
          {this.renderRescueMode()}
          {this.renderResetRootPassword()}
        </div>
        <div className="row">
          {this.renderRebuild()}
        </div>
      </div>
    );
  }
}

RepairPage.propTypes = {
  params: PropTypes.shape({
    linodeId: PropTypes.string,
  }),
};

export default connect(() => {})(RepairPage);
