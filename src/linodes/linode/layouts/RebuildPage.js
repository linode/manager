import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';

import { Card, CardHeader } from 'linode-components/cards';
import {
  FormGroup, FormGroupError, Form, SubmitButton, PasswordInput,
} from 'linode-components/forms';
import { reduceErrors, ErrorSummary } from '~/errors';
import Distributions from '~/linodes/components/Distributions';
import { setSource } from '~/actions/source';
import { rebuildLinode } from '~/api/linodes';
import { dispatchOrStoreErrors, FormSummary } from '~/components/forms';
import Distributions from '~/linodes/components/Distributions';

import { selectLinode } from '../utilities';


export class RebuildPage extends Component {
  static DEFAULT_DISTRIBUTION = 'linode/Ubuntu16.04LTS'

  constructor(props) {
    super(props);

    const distribution = props.linode.distribution;
    this.state = {
      distribution: distribution ? distribution.id : RebuildPage.DEFAULT_DISTRIBUTION,
      password: '',
      errors: {},
      loading: false,
    };
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
  }

  async onSubmit() {
    const { dispatch, linode: { id } } = this.props;

    await dispatch(dispatchOrStoreErrors.apply(this, [
      [
        () => rebuildLinode(id, {
          distribution: this.state.distribution,
          root_pass: this.state.password,
        }),
        () => this.setState({ password: '', distribution: RebuildPage.DEFAULT_DISTRIBUTION }),
      ],
      ['distribution'],
    ]));
  }

  onChange = ({ target: { name, value } }) => this.setState({ [name]: value })

  render() {
    const { distributions } = this.props;
    const { distribution, errors, loading } = this.state;

    return (
      <Card header={<CardHeader title="Rebuild" />}>
        <Form onSubmit={() => this.onSubmit()} className="LinodesLinodeRebuildPage-body">
          <div className="LinodesLinodeRebuildPage-distributions clearfix">
            <Distributions
              distributions={distributions.distributions}
              distribution={distribution}
              onSelected={distribution => this.setState({ distribution })}
              noDistribution={false}
            />
          </div>
          <div className="LinodesLinodeRebuildPage-password">
            <FormGroup errors={errors} name="root_pass" className="row">
              <label htmlFor="password" className="col-sm-2 col-form-label">Root password</label>
              <div className="col-sm-10 clearfix">
                <PasswordInput
                  name="password"
                  id="password"
                  value={this.state.password}
                  onChange={this.onChange}
                  className="float-sm-left"
                />
                <FormGroupError className="float-sm-left" errors={errors} name="root_pass" />
              </div>
            </FormGroup>
          </div>
          <FormGroup className="row">
            <div className="col-sm-10 offset-sm-2">
              <SubmitButton
                disabled={loading}
                disabledChildren="Rebuilding"
              >Rebuild</SubmitButton>
              <FormSummary errors={errors} success="Linode is being rebuilt." />
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
  linode: PropTypes.object.isRequired,
};

function select(state, props) {
  const { linode } = selectLinode(state, props);
  const { distributions } = state.api;
  return { linode, distributions };
}

export default connect(select)(RebuildPage);
