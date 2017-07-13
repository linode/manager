import _ from 'lodash';
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { Button } from 'linode-components/buttons';

import { showModal, hideModal } from '~/actions/modal';
import { clients } from '~/api';
import CreateHelper from '~/components/CreateHelper';

import { MyApplication, CreateOrEditApplication } from '../components';


export class MyAPIClientsPage extends Component {
  static async preload({ dispatch }) {
    await dispatch(clients.all());
  }

  renderCreateOAuthClient = () => {
    const { dispatch } = this.props;
    const title = 'Create an OAuth Client';

    dispatch(showModal(title, (
      <CreateOrEditApplication
        dispatch={dispatch}
        title={title}
        close={() => dispatch(hideModal())}
        submitText="Create"
        submitDisabledText="Creating"
      />
    )));
  };

  renderGroup = (group, i, groups) => {
    const { dispatch } = this.props;
    const _renderGroup = group.map(client =>
      <div className="col-lg-6" key={client.id}>
        <MyApplication client={client} dispatch={dispatch} />
      </div>
    );

    if (i === groups.length - 1) {
      return <div className="row">{_renderGroup}</div>;
    }

    return <section className="row">{_renderGroup}</section>;
  }

  render() {
    const clients = Object.values(this.props.clients.clients);

    return (
      <div>
        <header className="NavigationHeader clearfix">
          <Button
            onClick={this.renderCreateOAuthClient}
            className="float-sm-right"
          >
            Create an OAuth Client
          </Button>
        </header>
        {clients.length ? _.chunk(clients, 2).map(this.renderGroup) : (
          <CreateHelper
            label="applications"
            onClick={this.renderCreateOAuthClient}
            linkText="Create an OAuth Client"
          />
        )}
      </div>
    );
  }
}

MyAPIClientsPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  clients: PropTypes.object.isRequired,
};

function select(state) {
  return {
    clients: state.api.clients,
  };
}

export default connect(select)(MyAPIClientsPage);
