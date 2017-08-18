import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';

import { Card, CardHeader } from 'linode-components/cards';
import {
  FormGroup, FormGroupError, Form, FormSummary, Input, SubmitButton, PasswordInput,
} from 'linode-components/forms';
import { ConfirmModalBody } from 'linode-components/modals';
import { onChange } from 'linode-components/forms/utilities';

import { hideModal, showModal } from '~/actions/modal';
import { setSource } from '~/actions/source';
import { distributions } from '~/api';
import { rebuildLinode } from '~/api/linodes';
import { dispatchOrStoreErrors } from '~/api/util';
import { DistributionSelect } from '~/linodes/components';

import { selectLinode } from '../utilities';


export class RebuildPage extends Component {
  static async preload({ dispatch, getState }) {
    if (!getState().api.distributions.ids.length) {
      await dispatch(distributions.all());
    }
  }

  constructor(props) {
    super(props);

    const distribution = props.linode.distribution;

    this.state = {
      distribution: distribution ? distribution.id : undefined,
      password: '',
      errors: {},
      loading: false,
    };

    this.onChange = onChange.bind(this);
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
  }

  onSubmit = () => {
    const { dispatch, linode: { id, label }, distributions } = this.props;
    const { password, distribution } = this.state;
    const distroLabel = distributions[distribution].label;

    const callback = async () => {
      await dispatch(dispatchOrStoreErrors.call(this, [
        () => rebuildLinode(id, { distribution, root_pass: password }),
        () => this.setState({ password: '', distribution }),
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

  render() {
    const { distributions, linode: { distribution: { id: currentDistribution } } } = this.props;
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
          <FormGroup className="row">
            <label className="col-sm-3 col-form-label">Current Distribution</label>
            <div className="col-sm-9">
              <Input
                disabled
                value={(distributions[currentDistribution] || { label: 'Unknown' }).label}
              />
            </div>
          </FormGroup>
          <FormGroup errors={errors} name="distribution" className="row">
            <label className="col-sm-3 col-form-label">New Distribution</label>
            <div className="col-sm-9">
              <DistributionSelect
                distributions={distributions}
                value={distribution}
                name="distribution"
                id="distribution"
                onChange={this.onChange}
              />
              <FormGroupError errors={errors} name="distribution" inline={false} />
            </div>
          </FormGroup>
          <FormGroup errors={errors} name="root_pass" className="row">
            <label htmlFor="password" className="col-sm-3 col-form-label">Root password</label>
            <div className="col-sm-9 clearfix">
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
            <div className="col-sm-9 offset-sm-3">
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
  const { distributions } = state.api.distributions;
  return { linode, distributions };
}

export default connect(select)(RebuildPage);
