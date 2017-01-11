import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import PasswordInput from '~/components/PasswordInput';
import { FormGroup, reduceErrors, ErrorSummary } from '~/errors';
import Distributions from '~/linodes/components/Distributions';
import { setSource } from '~/actions/source';
import { rebuildLinode } from '~/api/linodes';
import { getLinode } from '~/linodes/linode/layouts/IndexPage';

export class RebuildPage extends Component {
  constructor(props) {
    super(props);
    this.onSubmit = this.onSubmit.bind(this);
    this.getLinode = getLinode.bind(this);
    this.state = {
      distribution: this.getLinode().distribution.id,
      password: null,
      errors: {},
      loading: false,
    };
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
  }

  async onSubmit() {
    const { dispatch, params: { linodeLabel } } = this.props;
    const { id: linodeId } = this.getLinode();

    this.setState({ loading: true, errors: {} });

    try {
      await dispatch(rebuildLinode(linodeId, {
        distribution: this.state.distribution,
        root_pass: this.state.password,
      }));
      dispatch(push(`/linodes/${linodeLabel}`));
    } catch (response) {
      const errors = await reduceErrors(response);
      errors._ = errors.distribution;
      this.setState({ errors });
    }

    this.setState({ loading: false });
  }

  render() {
    const { distributions } = this.props;
    const { distribution, errors } = this.state;

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
              <FormGroup errors={errors} field="root_pass" className="row">
                <div className="col-sm-2 label-col">
                  <label>Root password:</label>
                </div>
                <div className="col-sm-4">
                  <PasswordInput
                    value={this.state.password}
                    passwordType="offline_fast_hashing_1e10_per_second"
                    onChange={password => this.setState({ password })}
                  />
                </div>
              </FormGroup>
            </div>
            <div className="row">
              <div className="col-sm-2 offset-sm-2">
                <button
                  className="LinodesLinodeRebuildPage-rebuild"
                  onClick={this.onSubmit}
                  disabled={this.loading}
                >Rebuild</button>
              </div>
            </div>
            <ErrorSummary errors={errors} />
          </div>
        </div>
      </section>
    );
  }
}

RebuildPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  distributions: PropTypes.object.isRequired,
  linodes: PropTypes.object.isRequired,
  params: PropTypes.shape({
    linodeLabel: PropTypes.string.isRequired,
  }).isRequired,
};

function select(state) {
  return {
    distributions: state.api.distributions,
    linodes: state.api.linodes,
  };
}

export default connect(select)(RebuildPage);
