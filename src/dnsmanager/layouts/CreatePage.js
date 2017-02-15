import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import Card from '~/components/Card';
import Tabs from '~/components/Tabs';
import { setSource } from '~/actions/source';
import { setTitle } from '~/actions/title';
import { dnszones } from '~/api';
import NewMasterZone from '../components/NewMasterZone';

export class CreatePage extends Component {
  constructor(props) {
    super(props);
    this.addMasterZone = this.addMasterZone.bind(this);
    this.newMasterZoneChange = this.newMasterZoneChange.bind(this);
    this.state = {
      tabIndex: 0,
      newMasterZone: {
        dnszone: '',
        soa_email: props.email,
        type: 'master',
      },
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
    dispatch(setTitle('Add a zone'));
  }

  async addMasterZone(e) {
    e.preventDefault();
    const { dispatch } = this.props;
    await dispatch(dnszones.post(this.state.newMasterZone));
    await dispatch(push('/dnsmanager'));
  }

  newMasterZoneChange(field) {
    return e => {
      this.setState({ newMasterZone: {
        ...this.state.newMasterZone,
        [field]: e.target.value,
      } });
    };
  }

  render() {
    const tabs = [
      {
        name: 'New Master',
        children: (
          <NewMasterZone
            onSubmit={this.addMasterZone}
            onChange={this.newMasterZoneChange}
            soa_email={this.state.newMasterZone.soa_email}
            dnszone={this.state.newMasterZone.dnszone}
          />
        ),
      },
      {
        name: 'New Slave',
        children: 'TODO',
      },
      {
        name: 'Import',
        children: 'TODO',
      },
      {
        name: 'Clone',
        children: 'TODO',
      },
    ];

    return (
      <div className="container create-page">
        <header>
          <h1>Add a zone</h1>
        </header>
        <Card title="Source">
          <Tabs
            tabs={tabs}
            onClick={index => this.setState({ tabIndex: index })}
            selected={this.state.tabIndex}
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
