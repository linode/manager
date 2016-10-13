import React, { Component, PropTypes } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import _ from 'lodash';
import moment from 'moment';

import Distributions from './Distributions';
import Backups from './Backups';

export default class Source extends Component {
  constructor() {
    super();
    this.render = this.render.bind(this);
    this.renderSourceTabs = this.renderSourceTabs.bind(this);
    this.renderHeader = this.renderHeader.bind(this);
    this.renderDistributions = this.renderDistributions.bind(this);
    this.state = { backupsPage: 0, backupsFilter: '', selectedLinode: -1 };
  }

  renderDistributions() {
    const { distributions, distribution, onSourceSelected } = this.props;
    const vendors = _.sortBy(
      _.map(
        _.groupBy(Object.values(distributions), d => d.vendor),
        (v, k) => ({
          name: k,
          versions: _.orderBy(v, ['recommended', 'created'], ['desc', 'desc']),
        })
      ), vendor => vendor.name);
    return (
      <div className="distributions">
        {vendors.map(v =>
          <Distributions
            selected={distribution}
            vendor={v}
            key={v.name}
            onClick={s => onSourceSelected('distribution', s)}
          />)}
      </div>
    );
  }

  renderLinodeSelection() {
    const { linodes, perPageLimit } = this.props;
    const { backupsPage, backupsFilter } = this.state;
    const hasBackups = linode => (
      linode.backups && linode.backups.enabled && linode.label.indexOf(backupsFilter) !== -1
    );

    const linodesWithBackups = Object.values(_.filter(linodes.linodes, hasBackups));

    if (!linodesWithBackups.length) {
      return <section>No backups available.</section>;
    }

    const currentIndex = backupsPage * perPageLimit;
    const linodesOnPage = linodesWithBackups.slice(currentIndex, currentIndex + perPageLimit);

    const maxPage = Math.ceil(linodesWithBackups.length / perPageLimit) - 1;
    const gotoPage = page => e => {
      e.preventDefault();
      this.setState({ backupsPage: page });
    };
    const decreaseCount = gotoPage(Math.max(backupsPage - 1, 0));
    const increaseCount = gotoPage(Math.min(backupsPage + 1, maxPage));

    return (
      <div>
        <section>
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
        </section>

        <section>
          <table>
            <thead>
              <tr>
                <td>Label</td>
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
                  <td>{l.backups.last_backup ?
                       moment(l.backups.last_backup).format('dddd, MMMM D YYYY LT')
                     : 'Unknown'}</td>
                </tr>
               )}
            </tbody>
          </table>
        </section>
        {linodesWithBackups.length > perPageLimit ? (
          <nav className="text-xs-center">
            <ul className="pagination">
              <li className="page-item">
                <a href="#" aria-label="Previous" onClick={decreaseCount} className="page-link">
                  <span aria-hidden="true">&laquo;</span>
                </a>
              </li>
              {_.range(maxPage + 1).map(pageIndex =>
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
    const { onSourceSelected, backup, linodes } = this.props;

    if (backup && selectedLinode === -1) {
      // Select a linode
      const linode = Object.values(linodes.linodes)
        .find(l => Object.values(l._backups.backups).find(b => b.id === backup));
      if (linode) {
        this.setState({ selectedLinode: linode.id });
      }
    }

    return (
      <div className="backups">
        {selectedLinode === -1 ?
          this.renderLinodeSelection() :
          <Backups
            goBack={e => {
              e.preventDefault();
              this.setState({ selectedLinode: -1 });
              onSourceSelected('backup', null);
            }}
            onSourceSelected={id => onSourceSelected('backup', id, selectedLinode)}
            selectedLinode={selectedLinode}
            selected={backup}
          />}
      </div>
    );
  }

  renderSourceTabs() {
    const { selectedTab, onTabChange } = this.props;
    return (
      <div className="react-tabs">
        <Tabs
          onSelect={onTabChange}
          selectedIndex={selectedTab}
        >
          <TabList>
            <Tab>Distributions</Tab>
            <Tab>Backups</Tab>
          </TabList>
          <TabPanel>
            {this.renderDistributions()}
          </TabPanel>
          <TabPanel>
            {this.renderBackups()}
          </TabPanel>
        </Tabs>
      </div>
    );
  }

  renderHeader() {
    return (
      <header className="tabs">
        <h2>Source</h2>
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

Source.propTypes = {
  distributions: PropTypes.object.isRequired,
  linodes: PropTypes.object.isRequired,
  selectedTab: PropTypes.number.isRequired,
  onTabChange: PropTypes.func,
  onSourceSelected: PropTypes.func,
  distribution: PropTypes.string,
  backup: PropTypes.number,
  perPageLimit: PropTypes.number,
};

Source.defaultProps = {
  onTabChange: () => {},
  onSourceSelected: () => {},
  perPageLimit: 20,
};
