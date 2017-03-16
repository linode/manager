import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import { Card } from '~/components/cards';
import Tabs from '~/components/Tabs';
import { setSource } from '~/actions/source';
import { setTitle } from '~/actions/title';
import { dnszones } from '~/api';
import NewMasterZone from '../components/NewMasterZone';
import NewSlaveZone from '../components/NewSlaveZone';
import { reduceErrors } from '~/errors';

export class CreatePage extends Component {
  constructor(props) {
    super(props);
    this.addZone = this.addZone.bind(this);
    this.zoneStateChange = this.zoneStateChange.bind(this);
    this.state = {
      tabIndex: 0,
      loading: false,
      newMasterZone: {
        dnszone: '',
        soa_email: props.email,
        type: 'master',
        loading: false,
        errors: {},
      },
      newSlaveZone: {
        dnszone: '',
        master_ips: [],
        type: 'slave',
        loading: false,
        errors: {},
      },
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));

    dispatch(setTitle('Add a zone'));
  }

  async addZone(e, tab) {
    e.preventDefault();
    const { dispatch } = this.props;
    this.setState({ [tab]: {
      ...this.state[tab],
      loading: true,
    } });
    try {
      await dispatch(dnszones.post(this.state[tab]));
      await dispatch(push('/dnsmanager'));
    } catch (response) {
      const errors = await reduceErrors(response);
      this.setState({ [tab]: {
        ...this.state[tab],
        loading: false,
        errors,
      } });
    }
  }

  zoneStateChange(field, tab) {
    return e => {
      let value = e.target.value;
      if (field === 'master_ips') {
        value = value.split(';');
      }
      this.setState({ [tab]: {
        ...this.state[tab],
        [field]: value,
      } });
    };
  }

  render() {
    const tabs = [
      {
        name: 'New Master',
        children: (
          <NewMasterZone
            onSubmit={(e) => this.addZone(e, 'newMasterZone')}
            onChange={(e) => this.zoneStateChange(e, 'newMasterZone')}
            soa_email={this.state.newMasterZone.soa_email}
            dnszone={this.state.newMasterZone.dnszone}
            loading={this.state.newMasterZone.loading}
            errors={this.state.newMasterZone.errors}
          />
        ),
      },
      {
        name: 'New Slave',
        children: (
          <NewSlaveZone
            onSubmit={(e) => this.addZone(e, 'newSlaveZone')}
            onChange={(e) => this.zoneStateChange(e, 'newSlaveZone')}
            master_ips={this.state.newSlaveZone.master_ips}
            dnszone={this.state.newSlaveZone.dnszone}
            loading={this.state.newSlaveZone.loading}
            errors={this.state.newSlaveZone.errors}
          />
        ),
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
            onClick={(_, index) => this.setState({ tabIndex: index })}
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
