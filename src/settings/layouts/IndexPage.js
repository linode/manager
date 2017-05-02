import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { Card } from 'linode-components/cards';
import {
  Checkbox, Form, FormGroup, SubmitButton,
} from 'linode-components/forms';

import { setError } from '~/actions/errors';
import { setSource } from '~/actions/source';
import { setTitle } from '~/actions/title';
import { account } from '~/api';
import { dispatchOrStoreErrors, FormSummary } from '~/components/forms';


export class IndexPage extends Component {
  static async preload({ dispatch }) {
    try {
      await dispatch(account.one());
    } catch (response) {
      // eslint-disable-next-line no-console
      console.error(response);
      dispatch(setError(response));
    }
  }

  constructor(props) {
    super(props);

    this.state = {
      networkHelper: props.account.network_helper,
      errors: {},
    };
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));

    dispatch(setTitle('Account'));
  }

  onSubmit = async () => {
    const { dispatch } = this.props;
    const { networkHelper: network_helper } = this.state;

    await dispatch(dispatchOrStoreErrors.apply(this, [
      [() => account.put({ network_helper })],
    ]));
  }

  render() {
    const { networkHelper, loading, errors } = this.state;
    return (
      <div>
        <header className="main-header main-header--border">
          <div className="container">
            <h1>Account</h1>
          </div>
        </header>
        <div className="container">
          <Card>
            <Form onSubmit={this.onSubmit}>
              <p>
                This page controls the default account for all users.
              </p>
              <FormGroup className="row">
                <label className="col-sm-3 row-label">Enable Network Helper</label>
                <div className="col-sm-9">
                  <Checkbox
                    id="networkHelper"
                    checked={networkHelper}
                    onChange={() => this.setState({
                      networkHelper: !networkHelper,
                    })}
                    label="Network Helper automatically deposits a static
                      networking configuration into your Linode at boot."
                  />
                </div>
              </FormGroup>
              <FormGroup className="row">
                <div className="offset-sm-3 col-sm-9">
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
