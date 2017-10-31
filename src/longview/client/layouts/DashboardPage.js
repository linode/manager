import _ from 'lodash';
import React, { Component, PropTypes } from 'react';

import { getTopProcesses } from '~/api/longview/stats';
import { getObjectByLabelLazily } from '~/api/util';
import { connect } from 'react-redux';
import { fullyLoadedObject } from '~/api/external';
import MultiMetricSummary from '../components/MultiMetricSummary';
import { selectLVClient } from '../utilities';
import { HighchartsProvider } from 'react-highcharts-wrapper';

import { HIGHCHARTS_THEME } from '~/constants';
const OBJECT_TYPE = 'lvclients';

export class DashboardPage extends Component {
  static async preload({ dispatch }, { lvLabel }) {
    const { api_key } = await dispatch(getObjectByLabelLazily('lvclients', lvLabel));
    // await dispatch(getTopProcesses(api_key));
  }

  constructor(props) {
    super(props);

    this.state = { filter: '' };
  }

  render() {


    return (
      <div>
        <h3>Longview details</h3>
        
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
  <MultiMetricSummary />
  </HighchartsProvider> 

      </div>
    );
  }
}

DashboardPage.propTypes = {
  dispatch: PropTypes.func,
  //lvclient: PropTypes.object,  
};


function select(state, props) {
//  const { lvclient } = selectLVClient(state, props);
  
  const lvclients = _.pickBy(state.api.lvclients.lvclients, fullyLoadedObject);

  return {
  //  lvclient,
    lvclients,
    selectedMap: state.select.selected[OBJECT_TYPE] || {},
  };
}

export default connect(select)(DashboardPage);
