import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { Card } from 'linode-components/cards';
import { Form, Checkbox, SubmitButton } from 'linode-components/forms';

import { setSource } from '~/actions/source';
import { setTitle } from '~/actions/title';
import { account } from '~/api';
import { reduceErrors } from '~/errors';


export class IndexPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      networkHelper: props.account.network_helper,
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

    try {
      await dispatch(account.put({
        network_helper: this.state.networkHelper,
      }));
    } catch (response) {
      const errors = await reduceErrors(response);
      this.setState({ errors });
    }
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
                    value={networkHelper}
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
