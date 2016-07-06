import React, { Component, PropTypes } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import DistroVendor from './DistroVendor';
import _ from 'lodash';

export default class SourceSelection extends Component {
  constructor() {
    super();
    this.render = this.render.bind(this);
    this.renderSourceTabs = this.renderSourceTabs.bind(this);
    this.renderHeader = this.renderHeader.bind(this);
    this.renderDistros = this.renderDistros.bind(this);
  }

  renderDistros() {
    const { distros, source, onSourceSelected } = this.props;
    const vendors = _.sortBy(
      _.map(
        _.groupBy(Object.values(distros), d => d.vendor),
        (v, k) => ({
          name: k,
          versions: _.orderBy(v, ['recommended', 'created'], ['desc', 'desc']),
        })
      ), vendor => vendor.name);
    return (
      <div className="distros">
        {vendors.map(v =>
          <DistroVendor
            selected={source}
            vendor={v}
            key={v.name}
            onClick={s => onSourceSelected(s)}
          />)}
      </div>
    );
  }

  renderSourceTabs() {
    const { selectedTab, onTabChange } = this.props;
    return (
      <Tabs
        onSelect={onTabChange}
        selectedIndex={selectedTab}
      >
        <TabList>
          <Tab>Distributions</Tab>
          <Tab>StackScripts</Tab>
          <Tab>Backups</Tab>
        </TabList>
        <TabPanel>
          {this.renderDistros()}
        </TabPanel>
        <TabPanel>
          StackScript Selection
        </TabPanel>
        <TabPanel>
          Backups Selection
        </TabPanel>
      </Tabs>
    );
  }

  renderHeader() {
    return (
      <header className="tabs">
        <h2>Select a source</h2>
      </header>
    );
  }

  render() {
    return (
      <div>
        {this.renderHeader()}
        {this.renderSourceTabs()}
      </div>
    );
  }
}

SourceSelection.propTypes = {
  distros: PropTypes.object.isRequired,
  selectedTab: PropTypes.number.isRequired,
  onTabChange: PropTypes.func,
  onSourceSelected: PropTypes.func,
  source: PropTypes.string,
};

SourceSelection.defaultProps = {
  onTabChange: () => {},
  onSourceSelected: () => {},
};
