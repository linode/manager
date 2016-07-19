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
    this.state = { backupsPage: 0, backupsFilter: '' };
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
    const { linodes, selected, onSourceSelected, perPageLimit } = this.props;
    const { backupsPage, backupsFilter } = this.state;
    const hasBackups = (linode) =>
      linode.backups && linode.backups.enabled &&
      linode._backups && Object.values(linode._backups.backups).length &&
      linode.label.indexOf(backupsFilter) !== -1;
    const linodesWithBackups = Object.values(_.filter(linodes.linodes, hasBackups));

    const currentIndex = backupsPage * perPageLimit;
    const linodesOnPage = linodesWithBackups.slice(currentIndex, currentIndex + perPageLimit);
    const backupOptions = _.map(linodesOnPage, l =>
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

    const decreaseCount = e => {
      e.preventDefault();
      this.setState({ backupsPage: Math.max(backupsPage - 1, 0) });
    };
    const increaseCount = e => {
      e.preventDefault();
      const maxPage = Math.floor(linodesWithBackups.length / perPageLimit);
      this.setState({
        backupsPage: Math.min(backupsPage + 1, maxPage),
      });
    };

    return (
      <div className="backups">
        <div>
          <div className="filter input-container">
            <input
              type="text"
              onChange={e =>
                  this.setState({ backupsFilter: e.target.value, backupsPage: 0 })}
              value={this.state.backupsFilter}
              placeholder="Filter..."
              className="form-control"
            />
          </div>
        </div>
        {linodesWithBackups.length ? backupOptions : <span>No backups available.</span>}
        {linodesWithBackups.length > perPageLimit ? (
          <div className="clearfix">
            <div className="nav pull-right">
              <a
                href="#"
                onClick={decreaseCount}
                className="previous"
              >Previous</a>
              <a
                href="#"
                onClick={increaseCount}
                className="next"
              >Next</a>
            </div>
          </div>) : null}
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
  perPageLimit: PropTypes.number,
};

SourceSelection.defaultProps = {
  onTabChange: () => {},
  onSourceSelected: () => {},
  perPageLimit: 5,
};
