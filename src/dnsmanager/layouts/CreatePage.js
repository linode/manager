import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { push } from 'react-router-redux';

import { setSource } from '~/actions/source';
import { setTitle } from '~/actions/title';
import { dnszones } from '~/api';
import NewMasterZone from '../components/NewMasterZone';
import NewSlaveZone from '../components/NewSlaveZone';

export class CreatePage extends Component {
  constructor(props) {
    super(props);
    this.addMasterZone = this.addMasterZone.bind(this);
    this.newMasterZoneChange = this.newMasterZoneChange.bind(this);
    this.addSlaveZone = this.addSlaveZone.bind(this);
    this.newSlaveZoneChange = this.newSlaveZoneChange.bind(this);
    this.state = {
      tabIndex: 0,
      newMasterZone: {
        dnszone: '',
        soa_email: props.email,
        type: 'master',
      },
      newSlaveZone: {
        dnszone: '',
        masters: '',
        type: 'slave',
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

  async addSlaveZone(e) {
    e.preventDefault();
    const { dispatch } = this.props;
    await dispatch(dnszones.post(this.state.newSlaveZone));
    await dispatch(push('/dnsmanager'));
  }

  newSlaveZoneChange(field) {
    return e => {
      this.setState({ newSlaveZone: {
        ...this.state.newSlaveZone,
        [field]: e.target.value,
      } });
    };
  }

  render() {
    return (
      <div className="container DNSManager-create">
        <header>
          <h1>Add a zone</h1>
        </header>
        <section className="card">
          <header>
            <h2>Source</h2>
          </header>
          <div className="react-tabs">
            <Tabs
              onSelect={index => this.setState({ tabIndex: index })}
              selectedIndex={this.state.tabIndex}
              className="Tabs SubTabs"
            >
              <TabList>
                <Tab>New master</Tab>
                <Tab>New slave</Tab>
                <Tab>Import</Tab>
                <Tab>Clone</Tab>
              </TabList>
              <TabPanel>
                <section className="subtab-content-container">
                  <NewMasterZone
                    onSubmit={this.addMasterZone}
                    onChange={this.newMasterZoneChange}
                    soa_email={this.state.newMasterZone.soa_email}
                    dnszone={this.state.newMasterZone.dnszone}
                  />
                </section>
              </TabPanel>
              <TabPanel>
                <section className="subtab-content-container">
                  <NewSlaveZone
                    onSubmit={this.addSlaveZone}
                    onChange={this.newSlaveZoneChange}
                    masters={this.state.newSlaveZone.masters}
                    dnszone={this.state.newSlaveZone.dnszone}
                  />
                </section>
              </TabPanel>
              <TabPanel>
                <section>
                  TODO
                </section>
              </TabPanel>
              <TabPanel>
                <section>
                  TODO
                </section>
              </TabPanel>
            </Tabs>
          </div>
        </section>
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
