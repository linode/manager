import _ from 'lodash';
import React, { Component, PropTypes } from 'react';

import { Select } from 'linode-components/forms';
import { getTopProcesses, getValues } from '~/api/longview/stats';
import { getObjectByLabelLazily } from '~/api/util';
import { connect } from 'react-redux';
import { fullyLoadedObject } from '~/api/external';
import MultiMetricSummary from '../components/MultiMetricSummary';
import SystemSummary from '../components/SystemSummary';
import { selectLVClient } from '../utilities';
import { HighchartsProvider } from 'react-highcharts-wrapper';

import { HIGHCHARTS_THEME } from '~/constants';
const OBJECT_TYPE = 'lvclients';

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

export class DashboardPage extends Component {
  static async preload({ dispatch }, { lvLabel }) {
    // const { api_key } = await dispatch(getObjectByLabelLazily('lvclients', lvLabel));
  }

  constructor(props) {
    super(props);

    this.state = { timeselect: timeOptions[0].value };
  }

  componentWillMount() {
    const [start, end] = this.state.timeselect.split(':');
    const { api_key } = this.props.lvclient;
    console.log(getValues(api_key, ['Uptime', 'SysInfo.*', 'Packages.*'], start, end));
  }

  onDateChange = async (event) => {
    this.setState({ timeselect: event.target.value });
    const [start, end] = this.state.timeselect.split(':');
    const { api_key } = this.props.lvclient;

    await dispatch([
      getTopProcesses(api_key, ['Processes.*.count', 'Processes.*.cpu', 'Processes.*.mem'], start, end),
    ]);
  };

  render() {
    console.log(this.props);
    console.log(this.state);
    return (
      <div>
        <h3>Longview details</h3>
        <Select
          id="timeselect"
          name="timeselect"
          onChange={this.onDateChange}
          options={timeOptions}
          value={this.state.timeselect}
        />
        <HighchartsProvider
          executeFuncs={[
            (Highcharts) => {
              Highcharts.setOptions({
                ...HIGHCHARTS_THEME,
              });
              return Highcharts;
            },
          ]}
        >
          <div>
            <MultiMetricSummary {...this.props} />
            <SystemSummary {...this.props} />
          </div>
        </HighchartsProvider>

      </div>
    );
  }
}

DashboardPage.propTypes = {
  dispatch: PropTypes.func,
  lvclient: PropTypes.object,
};


function select(state, props) {
  const { lvclient } = selectLVClient(state, props);
  
//  const lvclients = _.pickBy(state.api.lvclients.lvclients, fullyLoadedObject);

  return {
    lvclient,
    selectedMap: state.select.selected[OBJECT_TYPE] || {},
  };
}

export default connect(select)(DashboardPage);
