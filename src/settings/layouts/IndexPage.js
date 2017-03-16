import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { setSource } from '~/actions/source';
import { setTitle } from '~/actions/title';
import { Card } from '~/components/cards';
import {
  Form,
  Checkbox,
  SubmitButton,
} from '~/components/form';
import { settings } from '~/api';
import { reduceErrors } from '~/errors';
import { setError } from '~/actions/errors';


export class IndexPage extends Component {
  static async preload({ dispatch }) {
    try {
      await dispatch(settings.one());
    } catch (response) {
      // eslint-disable-next-line no-console
      console.error(response);
      dispatch(setError(response));
    }
  }

  constructor(props) {
    super(props);

    this.state = {
      networkHelper: props.settings.network_helper,
    };
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));

    dispatch(setTitle('Settings'));
  }

  async onSubmit() {
    const { dispatch } = this.props;

    try {
      await dispatch(settings.put({
        network_helper: this.state.networkHelper,
      }));
    } catch (response) {
      const errors = await reduceErrors(response);
      this.setState({ errors });
    }
  }

  render() {
    const { networkHelper } = this.state;
    return (
      <div>
        <header className="main-header main-header--border">
          <div className="container">
            <h1>
              Settings
            </h1>
          </div>
        </header>
        <div className="container">
          <Card>
            <Form onSubmit={() => this.onSubmit()}>
              <p>
                This page controls the default settings for all users.
              </p>
              <div className="row">
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
              </div>
              <div className="row">
                <div className="offset-sm-3 col-sm-9">
                  <SubmitButton>Save settings</SubmitButton>
                </div>
              </div>
            </Form>
          </Card>
        </div>
      </div>
    );
  }
}

IndexPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  settings: PropTypes.object.isRequired,
};

function select(state) {
  return {
    settings: state.api.settings.settings.undefined,
  };
}

export default connect(select)(IndexPage);
