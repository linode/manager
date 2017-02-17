import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { setError } from '~/actions/errors';
import { clients } from '~/api';
import MyApplication from '../components/MyApplication';

export class MyApplicationsPage extends Component {
  static async preload({ dispatch }) {
    try {
      await dispatch(clients.all());
    } catch (response) {
      // eslint-disable-next-line no-console
      console.error(response);
      dispatch(setError(response));
    }
  }

  render() {
    const { dispatch, clients } = this.props;

    return (
      <div className="row">
        {Object.values(clients.clients).map(client =>
          <div className="col-lg-6" key={client.id}>
            <MyApplication client={client} dispatch={dispatch} />
          </div>
         )}
      </div>
    );
  }
}

MyApplicationsPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  clients: PropTypes.object.isRequired,
};

function select(state) {
  return {
    clients: state.api.clients,
  };
}

export default connect(select)(MyApplicationsPage);
