import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';

import { Card, CardHeader } from 'linode-components/cards';
import {
  FormGroup, FormGroupError, Form, SubmitButton, PasswordInput,
} from 'linode-components/forms';
import { ConfirmModalBody } from 'linode-components/modals';

import { hideModal, showModal } from '~/actions/modal';
import { setSource } from '~/actions/source';
import { distributions } from '~/api';
import { rebuildLinode } from '~/api/linodes';
import { dispatchOrStoreErrors } from '~/api/util';
import { FormSummary } from 'linode-components/forms';
import Distributions from '~/linodes/components/Distributions';

import { selectLinode } from '../utilities';


export class RebuildPage extends Component {
  static async preload({ dispatch, getState }) {
    if (!getState().api.distributions.ids.length) {
      await dispatch(distributions.all());
    }
  }

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

  onSubmit = () => {
    const { dispatch, linode: { id, label }, distributions: { distributions } } = this.props;
    const { password, distribution } = this.state;
    const distroLabel = distributions[distribution].label;

    const callback = async () => {
      await dispatch(dispatchOrStoreErrors.call(this, [
        () => rebuildLinode(id, { distribution, root_pass: password }),
        () => this.setState({ password: '', distribution: RebuildPage.DEFAULT_DISTRIBUTION }),
      ], ['distribution']));

      // We want to hide the modal regardless of the status of the call.
      dispatch(hideModal());
    };

    return dispatch(showModal('Rebuild Linode', (
      <ConfirmModalBody
        onCancel={() => dispatch(hideModal())}
        onSubmit={callback}
      >
        <p>
          Rebuilding will destroy all data, wipe your Linode clean, and start fresh.
          Are you sure you want to rebuild <strong>{label}</strong> with {distroLabel}?
        </p>
      </ConfirmModalBody>
    )));
  }

  onChange = ({ target: { name, value } }) => this.setState({ [name]: value })

  render() {
    const { distributions } = this.props;
    const { distribution, errors, loading } = this.state;

    return (
      <Card header={<CardHeader title="Rebuild" />}>
        <p>
          Rebuilding will destroy all data, wipe your Linode clean, and start fresh.
        </p>
        <Form
          onSubmit={this.onSubmit}
          analytics={{ title: 'Rebuild Linode' }}
        >
          <div className="clearfix">
            <Distributions
              distributions={distributions.distributions}
              distribution={distribution}
              onSelected={distribution => this.setState({ distribution })}
              noDistribution={false}
            />
          </div>
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
