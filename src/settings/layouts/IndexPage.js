import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { Card, CardHeader } from 'linode-components';
import {
  Radio,
  Checkboxes,
  Form,
  FormGroup,
  FormSummary,
  SubmitButton,
} from 'linode-components';
import { onChange } from 'linode-components';

import { setSource } from '~/actions';
import api from '~/api';
import { dispatchOrStoreErrors } from '~/api/util';
import ChainedDocumentTitle from '~/components/ChainedDocumentTitle';
import { ComponentPreload as Preload } from '~/decorators/Preload';


export class IndexPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      networkHelper: props.account.network_helper ? 'ON' : 'OFF',
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
    const { networkHelper } = this.state;

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => api.account.put({ network_helper: networkHelper === 'ON' }),
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
              <FormGroup className="row" name="default">
                <label className="col-form-label col-sm-2">Default Behavior</label>
                <div className="col-sm-10">
                  <Checkboxes>
                    <Radio
                      name="networkHelper"
                      checked={networkHelper === 'OFF'}
                      value="OFF"
                      label="OFF - This is the legacy / old account behavior"
                      onChange={this.onChange}
                    />
                    <Radio
                      name="networkHelper"
                      checked={networkHelper === 'ON'}
                      value="ON"
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
              <FormGroup className="row" name="submit">
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

function mapStateToProps(state) {
  return {
    account: state.api.account,
  };
}

export default compose(
  connect(mapStateToProps),
  Preload(
    async function (dispatch, props) {
      if (!Object.keys(props.account).length) {
        await dispatch(api.account.one());
      }
    }
  )
)(IndexPage);
