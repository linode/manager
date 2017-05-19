import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { Card, CardHeader } from 'linode-components/cards';
import {
  Radio, Checkboxes, Form, FormGroup, SubmitButton,
} from 'linode-components/forms';

import { setSource } from '~/actions/source';
import { setTitle } from '~/actions/title';
import { account } from '~/api';
import { dispatchOrStoreErrors, FormSummary } from '~/components/forms';


export class IndexPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      networkHelper: !!props.account.network_helper,
      errors: {},
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
    dispatch(setTitle('Account Settings'));
  }

  onSubmit = () => {
    const { dispatch } = this.props;
    const { networkHelper: network_helper } = this.state;

    await dispatch(dispatchOrStoreErrors.apply(this, [
      [() => account.put({ network_helper })],
    ]));
  }

  onChange = ({ target: { name, value, type, checked } }) =>
    this.setState({ [name]: type === 'checkbox' ? checked : value === 'true' })

  render() {
    const { networkHelper, loading, errors } = this.state;

    return (
      <div>
        <header className="main-header main-header--border">
          <div className="container">
            <h1>Account Settings</h1>
          </div>
        </header>
        <div className="container">
          <Card header={<CardHeader title="Network Helper" />}>
            <Form onSubmit={this.onSubmit}>
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
