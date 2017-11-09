import _ from 'lodash';
import React, { Component, PropTypes } from 'react';

import { Select } from 'linode-components/forms';
import { Card, CardHeader } from 'linode-components/cards';

import { setSource } from '~/actions/source';
import { getObjectByLabelLazily } from '~/api/util';
import { connect } from 'react-redux';
import { fullyLoadedObject } from '~/api/external';
import MultiMetricSummary from '../components/MultiMetricSummary';
import TopProcesses from '../components/TopProcesses';
import SystemSummary from '../components/SystemSummary';
import NetGraph from '../components/NetGraph';
import MemGraph from '../components/MemGraph';
import CPUGraph from '../components/CPUGraph';
import DiskGraph from '../components/DiskGraph';
import { selectLVClient } from '../utilities';
import { HighchartsProvider } from 'react-highcharts-wrapper';
import { getStoreKeyFn } from '~/api/longview/stats';
import { HIGHCHARTS_THEME } from '~/constants';
const OBJECT_TYPE = 'lvclients';


export class DashboardPage extends Component {

  componentWillMount() {
    console.log('dash to mount');
    // const [start, end] = this.state.timeselect.split(':');
    // const { api_key } = this.props.lvclient;
    // console.log(`api key is ${api_key}`);
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    await dispatch(setSource(__filename));
  }


  render() {
    const [start, end] = this.props.timeselect.split(':');
    const storeKeyFn = getStoreKeyFn('getValues', start, end);

    const lvValues = this.props.lvclient[storeKeyFn('getValues')] || {};
    const lvProcesses = this.props.lvclient[storeKeyFn('getTopProcesses')] || {};

    return (
      <article className="container">

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
                <CPUGraph
                  cpu_usage={lvValues.CPU}
                />
              </Card>
            </div>

            <div className="col-lg-4 col-md-4 col-sm-12">
              <div className="row">
                <Card className="col-sm-6 col-md-12">
                  <SystemSummary
                    sysinfo={lvValues.SysInfo}
                    packages={lvValues.Packages}
                    uptime={lvValues.Uptime}
                  />
                </Card>

                <Card
                  header={<CardHeader title="Top Processes" />}
                  className="col-sm-6 col-md-12 full-height"
                >
                  <TopProcesses
                    processes={lvProcesses.Processes}
                  />
                </Card>
              </div>
            </div>

            <div className="col-lg-8 col-md-8 col-sm-12">
              <Card header={<CardHeader title="Network" />} className="full-height">
                <NetGraph network={lvValues.Network} />
              </Card>
            </div>

            <div className="col-lg-8 col-md-8 col-sm-12">
              <Card header={<CardHeader title="Disk" />} className="full-height">
                <DiskGraph disks={lvValues.Disk} />
              </Card>
            </div>
            <div className="col-lg-8 col-md-8 col-sm-12">
              <Card header={<CardHeader title="Memory" />} className="full-height">
                <MemGraph mem_usage={lvValues.Memory} />
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
  lvclient: PropTypes.object.isRequired,
  children: PropTypes.node.isRequired,
  timeselect: PropTypes.string.isRequired,
};

function select(state, props) {
  const { lvclient } = selectLVClient(state, props);

  return {
    lvclient,
    selectedMap: state.select.selected[OBJECT_TYPE] || {},
  };
}

export default connect(select)(DashboardPage);
