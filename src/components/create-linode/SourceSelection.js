import React, { Component } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import DistroSelection from './DistroSelection';

export default class SourceSelection extends Component {
  constructor() {
    super();
    this.render = this.render.bind(this);
  }

  renderSourceTabs({ distros }) {
    return <Tabs
        onSelect={(ix, last) => console.log('hey')}
        selectedIndex={0}>
        <TabList>
          <Tab>Distributions</Tab>
          <Tab>StackScripts</Tab>
          <Tab>Backups</Tab>
        </TabList>
        <TabPanel>
          <DistroSelection distros={distros} />
        </TabPanel>
        <TabPanel>
          StackScript Selection
        </TabPanel>
        <TabPanel>
          Backups Selection
        </TabPanel>
      </Tabs>;
  }

  render() {
    return (
      <div className="card creation-step">
        <h2>Select a Source</h2>
        <div>
          {this.renderSourceTabs(this.props)}
        </div>
      </div>
    );
  }
}
