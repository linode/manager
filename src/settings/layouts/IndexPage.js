import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { setSource } from '~/actions/source';
import { setTitle } from '~/actions/title';
import { Card } from '~/components/cards';
import {
  Form,
  Checkbox,
  SubmitButton
} from '~/components/form';
//import { settings } from '~/api';


export class IndexPage extends Component {
  /*static async preload({ dispatch }) {
    try {
      //await dispatch(settings.one());
    } catch (response) {
      // eslint-disable-next-line no-console
      console.error(response);
      dispatch(setError(response));
    }
  }*/

  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));

    dispatch(setTitle('Settings'));
  }

  render() {
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
            <Form onSubmit={() => {}}>
              <label className="col-sm-2 col-form-label">Enable Network Helper</label>
              <div className="row">
                <Checkbox
                  id="config-enableDistroHelper"
                  checked={true}
                  onChange={() => this.setState({
                  })}
                  label="Network Helper automatically deposits a static networking configuration in to your Linode at boot."
                />
              </div>
              <div className="row">
                <div className="offset-sm-2 col-sm-10">
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
  dispatch: PropTypes.func,
};

function select() {
  return {
    //settings: state.api.settings.settings.undefined,
  };
}

export default connect(select)(IndexPage);
