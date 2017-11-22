import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

import { Card, CardHeader } from 'linode-components/cards';
import {
  Radio,
  Checkboxes,
  Form,
  FormGroup,
  FormSummary,
  SubmitButton,
} from 'linode-components/forms';
import { onChange } from 'linode-components/forms/utilities';

import { setSource } from '~/actions';
import api from '~/api';
import { dispatchOrStoreErrors } from '~/api/util';
import ChainedDocumentTitle from '~/components/ChainedDocumentTitle';


export class IndexPage extends Component {
  static async preload({ dispatch, getState }) {
    if (!Object.keys(getState().api.account).length) {
      await dispatch(api.account.one());
    }
  }

  constructor(props) {
    super(props);

    this.state = {
      networkHelper: !!props.account.network_helper,
      errors: {},
    };

    this.onChange = onChange.bind(this);
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
  }

  onSubmit = () => {
    const { dispatch } = this.props;
    const { networkHelper: network_helper } = this.state;

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => api.account.put({ network_helper }),
    ]));
  }

  render() {
    const { networkHelper, loading, errors } = this.state;

    return (
      <div>
        <ChainedDocumentTitle title="Account Settings" />
        <header className="main-header main-header--border">
          <div className="container">
            <h1>Account Settings</h1>
          </div>
        </header>
        <div className="container">
          <Card header={<CardHeader title="Network Helper" />}>
            <Form
              onSubmit={this.onSubmit}
              analytics={{ title: 'Account Settings' }}
            >
              <FormGroup className="row">
                <label className="col-form-label col-sm-2">Default Behavior</label>
                <div className="col-sm-10">
                  <Checkboxes>
                    <Radio
                      name="networkHelper"
                      checked={!networkHelper}
                      value="false"
                      label="OFF - This is the legacy / old account behavior"
                      onChange={this.onChange}
                    />
                    <Radio
                      name="networkHelper"
                      checked={networkHelper}
                      value="true"
                      onChange={this.onChange}
                      label="ON  - This is new account behavior. You probably want this."
                    />
                  </Checkboxes>
                  <div>
                    <small className="text-muted">
                      This controls the default setting for the Network Helper
                      on newly created Configuration Profiles.
                    </small>
                  </div>
                </div>
              </FormGroup>
              <FormGroup className="row">
                <div className="offset-sm-2 col-sm-10">
                  <SubmitButton disabled={loading} />
                  <FormSummary errors={errors} success="Account saved." />
                </div>
              </FormGroup>
            </Form>
          </Card>
        </div>
      </div>
    );
  }
}

IndexPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  account: PropTypes.object.isRequired,
};

function select(state) {
  return {
    account: state.api.account,
  };
}

export default connect(select)(IndexPage);
