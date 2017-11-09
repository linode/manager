import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { Link } from 'react-router';

import { Select } from 'linode-components/forms';
import { Tabs } from 'linode-components/tabs';
import { GroupLabel } from '~/components';

import { setAnalytics, setTitle } from '~/actions';
import api from '~/api';
import { getObjectByLabelLazily } from '~/api/util';
import { getTopProcesses, getValues } from '~/api/longview/stats';
import { selectLVClient } from '../utilities';

const timeOptions = [
  { value: '1800', label: 'Past 30 minutes (live)' },
  { value: '43200', label: 'Past 12 hours' },
  { value: '86339', label: 'Past 24 hours' },
  { value: '604800', label: 'Past 7 days' },
  { value: '2592000', label: 'Past 30 days' },
  { value: '31536000', label: 'Past year' },
  { value: '1483246800:1514782799', label: '2017' },
  { value: '1451624400:1483246799', label: '2016' },
  { value: '1420088400:1451624399', label: '2015' },
  { value: '1388552400:1420088399', label: '2014' },
];

// @todo replace false with a check for lv subscription
const notSubscribed = (option) => (false) || ['1800', '43200'].indexOf(option.value) < 0;
// @todo replace false with comparisson of option.value and lv client create date
const predatesInstall = (option) => false;
const timeOptionsMap = (option) => ({ ...option,
  disabled: notSubscribed(option) || predatesInstall(option),
});

export class IndexPage extends Component {
  static async fetchStats(dispatch, id, apiKey, start, end) {
    const procOpts = ['Processes.*.count', 'Processes.*.cpu', 'Processes.*.mem'];
    const valuesOpts = ['Uptime', 'SysInfo.*', 'Packages.*'];
    const loadOpts = ['Load'];
    const diskOpts = ['Disk.*.reads', 'Disk.*.writes', 'Disk.*.isswap'];
    const cpuOpts = ['CPU.*.wait', 'CPU.*.user', 'CPU.*.system'];
    const memOpts = ['Memory.real.used', 'Memory.real.cache', 'Memory.real.buffers', 'Memory.swap.used', 'Memory.real.free'];
    const netOpts = [
      'Network.Interface.*.rx_bytes', 'Network.Interface.*.tx_bytes',
      'Network.Linode.*.tx_bytes', 'Network.Linode.*.rx_bytes',
    ];

    try {
      await dispatch(
        getTopProcesses(id, apiKey, procOpts, start, end)
      ).then(dispatch(
        // @todo Consider splitting these
        getValues(id, apiKey, [
          ...cpuOpts,
          ...memOpts,
          ...valuesOpts,
          ...netOpts,
          ...diskOpts,
          ...loadOpts,
        ], start, end)
      ));
    } catch (e) {
      console.log('While fetching LVClient Stats');
      console.trace(e);
    }
  }

  static async preload({ dispatch, getState }, { lvLabel }) {
    const { api_key, id } = await dispatch(getObjectByLabelLazily('lvclients', lvLabel));
    const [start, end] = ['1800', null];
    IndexPage.fetchStats(dispatch, id, api_key, start, end);
  }

  constructor(props) {
    super(props);

    this.state = { timeselect: timeOptions[0].value };
  }

  async componentDidMount() {
    const { dispatch, lvclient } = this.props;
    // @todo fix this  - label not ready yet
    
    dispatch(setTitle(lvclient.label));
    dispatch(setAnalytics(['lvclients', 'lvclient']));
  }

  onDateChange = async (event) => {
    this.setState({ timeselect: event.target.value });
    const [start, end] = event.target.value.split(':');
    const { id, api_key } = this.props.lvclient;
    IndexPage.fetchStats(this.props.dispatch, id, api_key, start, end);
  };

  render() {
    const { lvclient } = this.props;

    if (!lvclient) { return null; }

    const tabs = [
      { name: 'Dashboard', link: '' },
      { name: 'Network', link: '/network' },
      { name: 'Disks', link: '/disks' },
      { name: 'Process Explorer', link: '/processes' },
      { name: 'System', link: '/system' },
      { name: 'Settings', link: '/settings' },
    ].map(t => ({ ...t, link: `/longview/${encodeURIComponent(lvclient.label)}${t.link}` }));
    
    const allMyChildren = React.Children.map(
      this.props.children,
      (child) => React.cloneElement(child, {
        timeselect: this.state.timeselect,
      }
    ));

    return (
      <div>
        <header className="main-header">
          <div className="container">
            <div className="float-sm-left">
              <Link to="/longview">Longview Clients</Link>
              <h1 title={lvclient.id}>
                <Link to={`/longview/${lvclient.label}`}>
                  <GroupLabel object={lvclient} />
                </Link>
              </h1>
            </div>
            <div className="float-sm-right">
              <Select
                id="timeselect"
                name="timeselect"
                onChange={this.onDateChange}
                options={timeOptions.map(timeOptionsMap)}
                value={this.state.timeselect}
                className="col-sm-3"
              />
            </div>
          </div>
        </header>
        <div className="main-header-fix"></div>
        <Tabs
          tabs={tabs}
          onClick={(e, tabIndex) => {
            e.stopPropagation();
            this.props.dispatch(push(tabs[tabIndex].link));
          }}
          pathname={location.pathname}
        >
          {allMyChildren}
        </Tabs>
      </div>
    );
  }
}

IndexPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  lvclient: PropTypes.object.isRequired,
};

export default connect(selectLVClient)(IndexPage);
