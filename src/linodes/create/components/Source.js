import React, { Component, PropTypes } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import _ from 'lodash';
import moment from 'moment';

import Distributions from '~/linodes/components/Distributions';
import Backups from './Backups';
import Input from '~/components/Input';

export default class Source extends Component {
  constructor() {
    super();
    this.state = { backupsPage: 0, backupsFilter: '', selectedLinode: -1 };
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
          <div className="filter">
            <Input
              onChange={e =>
                this.setState({ backupsFilter: e.target.value, backupsPage: 0 })}
              value={backupsFilter}
              placeholder="Filter..."
            />
          </div>
        </section>

        <section>
          <table>
            <thead>
              <tr>
                <td>Linode</td>
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

  render() {
    const {
      selectedTab, onTabChange, distributions, distribution, onSourceSelected, backup,
      linodes,
    } = this.props;

    const { selectedLinode } = this.state;

    if (backup && selectedLinode === -1) {
      // Select a linode
      const linode = Object.values(linodes.linodes)
        .find(l => Object.values(l._backups.backups).find(b => b.id === backup));
      if (linode) {
        this.setState({ selectedLinode: linode.id });
      }
    }

    return (
      <div>
        <header>
          <h2>Source</h2>
        </header>
        <div className="react-tabs">
          <Tabs
            onSelect={onTabChange}
            selectedIndex={selectedTab}
          >
            <TabList className="form-tab-list">
              <Tab>Distributions</Tab>
              <Tab>Backups</Tab>
              <Tab>Clone</Tab>
              <Tab>StackScripts</Tab>
            </TabList>
            <TabPanel>
              <section>
                <Distributions
                  distributions={distributions}
                  distribution={distribution}
                  onSelected={d => onSourceSelected('distribution', d)}
                />
              </section>
            </TabPanel>
            <TabPanel>
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
            </TabPanel>
            <TabPanel>TODO</TabPanel>
            <TabPanel>TODO</TabPanel>
          </Tabs>
        </div>
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
