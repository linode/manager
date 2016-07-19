import React, { Component, PropTypes } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import _ from 'lodash';
import moment from 'moment';

import DistroVendor from './DistroVendor';
import Backup from '~/linodes/components/Backup';

export default class SourceSelection extends Component {
  constructor() {
    super();
    this.render = this.render.bind(this);
    this.renderSourceTabs = this.renderSourceTabs.bind(this);
    this.renderHeader = this.renderHeader.bind(this);
    this.renderDistros = this.renderDistros.bind(this);
    this.state = { backupsPage: 0, backupsFilter: '', selectedLinode: -1 };
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

  renderBackupSelection() {
    const { linodes, selected, onSourceSelected } = this.props;
    const id = this.state.selectedLinode;
    const l = linodes.linodes[id];
    return (
      <div className="clearfix">
        <div className="pull-right">
          <a
            href="#"
            onClick={e => {
              e.preventDefault();
              this.setState({ selectedLinode: -1 });
            }}
          >Back</a>
        </div>
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
      </div>
    );
  }

  renderLinodeSelection() {
    const { linodes, perPageLimit } = this.props;
    const { backupsPage, backupsFilter } = this.state;
    const hasBackups = (linode) =>
      linode.backups && linode.backups.enabled &&
      linode._backups && Object.values(linode._backups.backups).length &&
      linode.label.indexOf(backupsFilter) !== -1;
    const linodesWithBackups = Object.values(_.filter(linodes.linodes, hasBackups));

    if (!linodesWithBackups.length) {
      return <span>No backups available.</span>;
    }

    const currentIndex = backupsPage * perPageLimit;
    const linodesOnPage = linodesWithBackups.slice(currentIndex, currentIndex + perPageLimit);

    const maxPage = Math.floor(linodesWithBackups.length / perPageLimit);
    const gotoPage = page => e => {
      e.preventDefault();
      this.setState({ backupsPage: page });
    };
    const decreaseCount = gotoPage(Math.max(backupsPage - 1, 0));
    const increaseCount = gotoPage(Math.min(backupsPage + 1, maxPage));

    return (
      <div>
        <div>
          <div className="filter input-container">
            <input
              type="text"
              onChange={e =>
                this.setState({ backupsFilter: e.target.value, backupsPage: 0 })}
              value={backupsFilter}
              placeholder="Filter..."
              className="form-control"
            />
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <td>Label</td>
              <td>Backups available</td>
              <td>Last backup</td>
            </tr>
          </thead>
          <tbody>
            {_.map(linodesOnPage, l =>
              <tr key={l.created}>
                <td>
                  <a
                    href="#"
                    onClick={e => {
                      e.preventDefault();
                      this.setState({ selectedLinode: l.id });
                    }}
                  >{l.label}</a>
                </td>
                <td>{Object.values(l._backups.backups).length}</td>
                <td>{moment(l.backups.last_backup).format('dddd, MMMM D YYYY LT')}</td>
              </tr>
             )}
          </tbody>
        </table>
        {linodesWithBackups.length > perPageLimit ? (
          <nav className="text-xs-center">
            <ul className="pagination">
              <li className="page-item">
                <a href="#" aria-label="Previous" onClick={decreaseCount} className="page-link">
                  <span aria-hidden="true">&laquo;</span>
                </a>
              </li>
              {_.range(maxPage).map(pageIndex =>
                <li className="page-item" key={pageIndex}>
                  <a href="#" onClick={gotoPage(pageIndex)} className="page-link">
                    {pageIndex + 1}
                  </a>
                </li>)}
              <li className="page-item">
                <a href="#" aria-label="Next" onClick={increaseCount} className="page-link">
                  <span aria-hidden="true">&raquo;</span>
                </a>
              </li>
            </ul>
          </nav>
        ) : null}
      </div>
    );
  }

  renderBackups() {
    const { selectedLinode } = this.state;

    return (
      <div className="backups">
        {selectedLinode === -1 ?
         this.renderLinodeSelection() :
         this.renderBackupSelection()}
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
  perPageLimit: 20,
};
