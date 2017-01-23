import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import { Card } from '~/components';
import { Form, FormGroup, PasswordInput, SubmitButton } from '~/components/form';
import Distributions from '~/linodes/components/Distributions';
import { setSource } from '~/actions/source';
import { rebuildLinode } from '~/api/linodes';
import { getLinode } from '~/linodes/linode/layouts/IndexPage';

export class RebuildPage extends Component {
  constructor() {
    super();
    this.onSubmit = this.onSubmit.bind(this);
    this.getLinode = getLinode.bind(this);
    this.state = { distribution: null, password: '' };
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
  }

  async onSubmit() {
    const { dispatch, params: { linodeLabel } } = this.props;
    const { id: linodeId } = this.getLinode();
    try {
      dispatch(rebuildLinode(linodeId, {
        distribution: this.state.distribution,
        root_pass: this.state.password,
      }));
      dispatch(push(`/linodes/${linodeLabel}`));
    } catch (e) {
      // TODO: handle errors
    }
  }

  render() {
    const { distributions } = this.props;
    const { distribution } = this.state;

    return (
      <Card title="Rebuild">
        <Form onSubmit={() => this.onSubmit()} className="LinodesLinodeRebuildPage-body">
          <div className="LinodesLinodeRebuildPage-distributions">
            <Distributions
              distributions={distributions.distributions}
              distribution={distribution}
              onSelected={distribution => this.setState({ distribution })}
              noDistribution={false}
            />
          </div>
          <div className="LinodesLinodeRebuildPage-password">
            <FormGroup className="row">
              <div className="label-col col-sm-2">
                <label htmlFor="">Root password</label>
              </div>
              <div className="col-sm-10">
                <PasswordInput
                  value={this.state.password}
                  passwordType="offline_fast_hashing_1e10_per_second"
                  onChange={password => this.setState({ password })}
                />
              </div>
            </FormGroup>
          </div>
          <FormGroup className="row">
            <div className="offset-sm-2 col-sm-10">
              <SubmitButton
                className="LinodesLinodeRebuildPage-rebuild"
                disabled={!(this.state.password && this.state.distribution)}
              >Rebuild</SubmitButton>
            </div>
          </FormGroup>
        </Form>
      </Card>
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
