import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import { Card } from '~/components/cards';
import {
  FormGroup, FormGroupError, Form, SubmitButton, PasswordInput,
} from '~/components/form';
import { reduceErrors, ErrorSummary } from '~/errors';
import Distributions from '~/linodes/components/Distributions';
import { setSource } from '~/actions/source';
import { rebuildLinode } from '~/api/linodes';
import { getLinode } from '~/linodes/linode/layouts/IndexPage';

export class RebuildPage extends Component {
  constructor(props) {
    super(props);
    this.getLinode = getLinode.bind(this);
    const distribution = this.getLinode().distribution;
    this.state = {
      distribution: distribution ? distribution.id : 'linode/Ubuntu16.04LTS',
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
      errors._.concat(errors.distribution);
      this.setState({ errors });
    }

    this.setState({ loading: false });
  }

  render() {
    const { distributions } = this.props;
    const { distribution, errors } = this.state;

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
            <FormGroup errors={errors} name="root_pass" className="row">
              <label className="col-sm-2 col-form-label">Root password:</label>
              <div className="col-sm-10">
                <PasswordInput
                  value={this.state.password}
                  passwordType="offline_fast_hashing_1e10_per_second"
                  onChange={password => this.setState({ password })}
                />
                <FormGroupError errors={errors} name="root_pass" />
              </div>
            </FormGroup>
          </div>
          <div className="form-group row">
            <div className="col-sm-2 offset-sm-2">
              <SubmitButton
                disabled={this.loading}
              >Rebuild</SubmitButton>
            </div>
          </div>
          <ErrorSummary errors={errors} />
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
