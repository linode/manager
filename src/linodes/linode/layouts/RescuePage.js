import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { getLinode } from './IndexPage';
import { linodes } from '~/api';
import { powerOnLinode, powerOffLinode, resetPassword } from '~/api/linodes';
import PasswordInput from '~/components/PasswordInput';
import HelpButton from '~/components/HelpButton';

export class RescuePage extends Component {
  constructor() {
    super();
    this.getLinode = getLinode.bind(this);
    this.resetRootPassword = this.resetRootPassword.bind(this);
    this.renderRescueMode = this.renderRescueMode.bind(this);
    this.renderResetRootPassword = this.renderResetRootPassword.bind(this);
    this.state = {
      password: '',
      disk: null,
      loading: true,
      applying: false,
      result: null,
    };
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    const { linodeId } = this.props.params;
    await dispatch(linodes.one(linodeId));
    await dispatch(linodes.disks.all(linodeId));
    const linode = this.getLinode();
    const disk = Object.values(linode._disks.disks)
                       .filter(d => d.filesystem !== 'swap')[0];
    this.setState({
      loading: false,
      disk: disk ? disk.id : null,
    });
  }

  async resetRootPassword() {
    const { password, disk } = this.state;
    const { dispatch } = this.props;
    const linode = this.getLinode();
    const state = linode.state;
    const powered = linode.state === 'running' || linode.state === 'booting';

    try {
      this.setState({ applying: true, result: null });

      const actions = powered ? [
        powerOffLinode(linode.id),
        resetPassword(linode.id, disk, password),
        powerOnLinode(linode.id),
      ] : [resetPassword(linode.id, disk, password)];

      await Promise.all(actions.map(dispatch));

      this.setState({
        applying: false,
        result: <span className="text-success">Success!</span>,
      });
    } catch (response) {
      this.setState({
        applying: false,
        result: <span className="text-danger">An error occured.</span>,
      });
    }
    dispatch(linodes.until(l => l.state === state, linode.id));
  }

  renderRescueMode() {
    return (
      <div className="col-sm-6">
        <section className="card">
          <header>
            <h2>
              Rescue mode
              <HelpButton to="http://example.org" />
            </h2>
          </header>
          <p>TODO</p>
        </section>
      </div>
    );
  }

  renderResetRootPassword() {
    const { disk, loading } = this.state;
    let body = null;
    if (loading) {
      body = null;
    } else if (disk === null) {
      body = (
        <p>This Linode does not have any disks eligible for password reset.</p>
      );
    } else {
      const linode = this.getLinode();
      const showDisks = linode && linode._disks.totalPages !== -1 ?
        Object.values(linode._disks.disks)
          .filter(d => d.filesystem !== 'swap').length > 1 : false;
      body = (
        <div className="root-pw">
          {showDisks ?
            <div className="input-group input-container">
              <select
                value={disk}
                className="form-control"
                onChange={e => this.setState({ disk: e.target.value })}
              >
                {Object.values(linode._disks.disks)
                  .filter(d => d.filesystem !== 'swap')
                  .map(d => <option value={d.id} key={d.id}>{d.label}</option>)}
              </select>
            </div>
          : null}
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
            disabled={!this.state.password || this.state.applying}
            onClick={this.resetRootPassword}
          >Reset Password</button>
          <span style={{ marginLeft: '0.5rem' }}>
            {this.state.result}
          </span>
        </div>
      );
    }
    return (
      <div className="col-sm-6">
        <section className="card">
          <header>
            <h2>
              Reset root password
              <HelpButton to="http://example.org" />
            </h2>
          </header>
          {body}
        </section>
      </div>
    );
  }

  render() {
    return (
      <div className="row">
        {this.renderRescueMode()}
        {this.renderResetRootPassword()}
      </div>
    );
  }
}

RescuePage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  params: PropTypes.shape({
    linodeId: PropTypes.string,
  }),
};

function select(state) {
  return { linodes: state.api.linodes };
}

export default connect(select)(RescuePage);
