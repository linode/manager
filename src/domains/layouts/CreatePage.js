import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { Card, CardHeader } from 'linode-components/cards';
import { Tabs } from 'linode-components/tabs';

import { setSource } from '~/actions/source';
import { setTitle } from '~/actions/title';

import NewMasterZone from '../components/NewMasterZone';
import NewSlaveZone from '../components/NewSlaveZone';


export class CreatePage extends Component {
  constructor() {
    super();

    this.state = { tabIndex: 0 };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
    dispatch(setTitle('Add a Domain'));
  }

  render() {
    const { email, dispatch } = this.props;

    const tabs = [
      {
        name: 'New Master',
        children: <NewMasterZone dispatch={dispatch} email={email} />,
      },
      {
        name: 'New Slave',
        children: <NewSlaveZone dispatch={dispatch} />,
      },
    ];

    return (
      <div className="container create-page">
        <header>
          <Link to="/domains">Domains</Link>
          <h1>Add a Domain</h1>
        </header>
        <Card header={<CardHeader title="Source" />}>
          <Tabs
            tabs={tabs}
            onClick={(_, index) => this.setState({ tabIndex: index })}
            selectedIndex={this.state.tabIndex}
            isSubTabs
          />
        </Card>
      </div>
    );
  }
}

CreatePage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  email: PropTypes.string.isRequired,
};

function select(state) {
  return {
    email: state.authentication.email,
  };
}

export default connect(select)(CreatePage);
