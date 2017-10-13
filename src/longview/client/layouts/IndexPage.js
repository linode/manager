import _ from 'lodash';
import React, { Component, PropTypes } from 'react';

import { getTopProcesses } from '~/api/longview/stats';
import { getObjectByLabelLazily } from '~/api/util';
import { connect } from 'react-redux';
import { fullyLoadedObject } from '~/api/external';

const OBJECT_TYPE = 'lvclients';

export class IndexPage extends Component {
  static async preload({ dispatch }, { lvLabel }) {
    const { api_key } = await dispatch(getObjectByLabelLazily('lvclients', lvLabel));
    await dispatch(getTopProcesses(api_key));
  }

  constructor(props) {
    super(props);

    this.state = { filter: '' };
  }

  render() {
    return (
      <div>Longview details</div>
    );
  }
}

IndexPage.propTypes = {
  dispatch: PropTypes.func,
};


function select(state) {
  const lvclients = _.pickBy(state.api.lvclients.lvclients, fullyLoadedObject);

  return {
    lvclients,
    selectedMap: state.select.selected[OBJECT_TYPE] || {},
  };
}

export default connect(select)(IndexPage);
