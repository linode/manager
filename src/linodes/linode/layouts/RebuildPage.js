import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import PasswordInput from '~/components/PasswordInput';
import FormRow from '~/components/FormRow';
import Distributions from '~/linodes/components/Distributions';
import { setError } from '~/actions/errors';
import { setSource } from '~/actions/source';
import { distributions } from '~/api';
import { rebuildLinode } from '~/api/linodes';

export class RebuildPage extends Component {
  static async preload(store) {
    const { dispatch } = store;

    try {
      await dispatch(distributions.all());
    } catch (response) {
      dispatch(setError(response));
    }
  }

  constructor() {
    super();
    this.onSubmit = this.onSubmit.bind(this);
    this.state = { distribution: null, password: '' };
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
  }

  async onSubmit() {
    const { dispatch, params: { linodeId } } = this.props;
    try {
      dispatch(rebuildLinode(linodeId, {
        distribution: this.state.distribution,
        root_pass: this.state.password,
      }));
      dispatch(push(`/linodes/${linodeId}`));
    } catch (e) {
      // TODO: handle errors
    }
  }

  render() {
    const { distributions } = this.props;
    const { distribution } = this.state;

    return (
      <section className="LinodesLinodeRebuildPage">
        <div className="card">
          <header className="LinodesLinodeRebuildPage-header">
            <h2 className="LinodesLinodeRebuildPage-title">Rebuild</h2>
          </header>
          <div className="LinodesLinodeRebuildPage-body">
            <div className="LinodesLinodeRebuildPage-distributions">
              <Distributions
                distributions={distributions.distributions}
                distribution={distribution}
                onSelected={distribution => this.setState({ distribution })}
                noDistribution={false}
              />
            </div>
            <div className="LinodesLinodeRebuildPage-password">
              <FormRow label="Root password">
                <PasswordInput
                  value={this.state.password}
                  passwordType="offline_fast_hashing_1e10_per_second"
                  onChange={password => this.setState({ password })}
                />
              </FormRow>
            </div>
            <FormRow>
              <button
                className="LinodesLinodeRebuildPage-rebuild"
                onClick={this.onSubmit}
                disabled={!(this.state.password && this.state.distribution)}
              >Rebuild</button>
            </FormRow>
          </div>
        </div>
      </section>
    );
  }
}

RebuildPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  distributions: PropTypes.object.isRequired,
  params: PropTypes.shape({
    linodeId: PropTypes.string.isRequired,
  }).isRequired,
};

function select(state) {
  return {
    distributions: state.api.distributions,
  };
}

export default connect(select)(RebuildPage);
