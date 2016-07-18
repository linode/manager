import React, { Component, PropTypes } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import _ from 'lodash';

import DistroVendor from './DistroVendor';
import Backup from '~/linodes/components/Backup';

export default class SourceSelection extends Component {
  constructor() {
    super();
    this.render = this.render.bind(this);
    this.renderSourceTabs = this.renderSourceTabs.bind(this);
    this.renderHeader = this.renderHeader.bind(this);
    this.renderDistros = this.renderDistros.bind(this);
  }

  renderDistros() {
    const { distros, selected, onSourceSelected } = this.props;
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
            selected={selected}
            vendor={v}
            key={v.name}
            onClick={s => onSourceSelected(s)}
          />)}
      </div>
    );
  }

  renderBackups() {
    const { linodes, selected, onSourceSelected } = this.props;
    const hasBackups = (linode) =>
      linode.backups && linode.backups.enabled &&
      linode._backups && Object.values(linode._backups.backups).length;
    const linodesWithBackups = _.filter(linodes.linodes, hasBackups);

    const backupOptions = _.map(linodesWithBackups, l =>
      <div key={l.label}>
        <h3>{l.label}</h3>
        <div className="backup-group">
          {_.map(l._backups.backups, backup =>
            <Backup
              backup={backup}
              selected={selected}
              onSelect={() => onSourceSelected(backup.id)}
              key={backup.created}
            />
           )}
        </div>
      </div>
    );

    return (
      <div className="backups">
        {linodesWithBackups.length ? backupOptions : <span>No backups available.</span>}
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
          <Tab>Backups</Tab>
        </TabList>
        <TabPanel>
          {this.renderDistros()}
        </TabPanel>
        <TabPanel>
          {this.renderBackups()}
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
  linodes: PropTypes.object.isRequired,
  selectedTab: PropTypes.number.isRequired,
  onTabChange: PropTypes.func,
  onSourceSelected: PropTypes.func,
  selected: PropTypes.string,
};

SourceSelection.defaultProps = {
  onTabChange: () => {},
  onSourceSelected: () => {},
};
