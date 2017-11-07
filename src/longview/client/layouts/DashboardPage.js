import _ from 'lodash';
import React, { Component, PropTypes } from 'react';

import { Select } from 'linode-components/forms';
import { Card, CardHeader } from 'linode-components/cards';

import { setSource } from '~/actions/source';
import { getTopProcesses, getValues } from '~/api/longview/stats';
import { getObjectByLabelLazily } from '~/api/util';
import { connect } from 'react-redux';
import { fullyLoadedObject } from '~/api/external';
import MultiMetricSummary from '../components/MultiMetricSummary';
import TopProcesses from '../components/TopProcesses';
import SystemSummary from '../components/SystemSummary';
import NetGraph from '../components/NetGraph';
import CPUGraph from '../components/CPUGraph';
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
  static async preload({ dispatch, getState }, { lvLabel }) {
    const { api_key, id } = await dispatch(getObjectByLabelLazily('lvclients', lvLabel));
    const [start, end] = ['1800', null];

    const procOpts = ['Processes.*.count', 'Processes.*.cpu', 'Processes.*.mem'];
    const valuesOpts = ['Uptime', 'SysInfo.*', 'Packages.*'];
    const cpuOpts = ['CPU.*.wait', 'CPU.*.user', 'CPU.*.system'];
    const memOpts = ['Memory.real.used', 'Memory.real.cache', 'Memory.real.buffers', 'Memory.swap.used', 'Memory.real.free'];
    const netOpts = [
      'Network.Interface.*.rx_bytes', 'Network.Interface.*.tx_bytes',
      'Network.Linode.*.tx_bytes', 'Network.Linode.*.rx_bytes',
    ];

    try {
      await dispatch(
        getTopProcesses(id, api_key, procOpts, start, end)
//      ).then(dispatch(
//        getValues(id, api_key, valuesOpts, start, end)
//      )
    ).then(dispatch(
        getValues(id, api_key, [...cpuOpts, ...memOpts, ...valuesOpts, ...netOpts], start, end)
      ));
    } catch (e) {
      console.log('While fetching LVClient Stats');
      console.trace(e);
    }
  }

  constructor(props) {
    super(props);

    this.state = { timeselect: timeOptions[0].value };
  }

  componentWillMount() {
    // const [start, end] = this.state.timeselect.split(':');
    // const { api_key } = this.props.lvclient;
    // console.log(`api key is ${api_key}`);
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    await dispatch(setSource(__filename));
  }

  onDateChange = async (event) => {
    console.log('new value is ', event.target.value);
    this.setState({ timeselect: event.target.value });
    const [start, end] = this.state.timeselect.split(':');
    const { api_key } = this.props.lvclient;
  };

  render() {
    console.log(this.props);
    console.log(this.state);
    return (
      <article className="container">
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
          <section className="row">
            <div className="col-lg-8 col-md-8 col-sm-12">
              <Card header={<CardHeader title="CPU" />} className="full-height">
                <CPUGraph {...this.props} />
              </Card>
            </div>

            <div className="col-lg-4 col-md-4 col-sm-12">
              <div className="row">
                <Card className="col-sm-6 col-md-12">
                  <SystemSummary {...this.props} />
                </Card>

                <Card
                  header={<CardHeader title="Top Processes" />}
                  className="col-sm-6 col-md-12 full-height"
                >
                  <TopProcesses {...this.props} />
                </Card>
              </div>
            </div>

            <div className="col-lg-8 col-md-8 col-sm-12">
              <Card header={<CardHeader title="Network" />} className="full-height">
                <NetGraph {...this.props} />
              </Card>
            </div>

          </section>
        </HighchartsProvider>

      </article>
    );
  }
}

DashboardPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
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
