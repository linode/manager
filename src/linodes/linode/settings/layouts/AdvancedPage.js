import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { setSource } from '~/actions/source';
import { linodes } from '~/api';
import { getObjectByLabelLazily } from '~/api/util';

import { ConfigPanel } from '../components/ConfigPanel';
import { DiskPanel } from '../components/DiskPanel';

import { selectLinode } from '../../utilities';


export class AdvancedPage extends Component {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
  }

  render() {
    return (
      <div>
        <ConfigPanel {...this.props} />
        <DiskPanel {...this.props} />
      </div>
    );
  }
}

AdvancedPage.propTypes = {
  linode: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  distributions: PropTypes.object.isRequired,
};

function select(state, params) {
  const { linode } = selectLinode(state, params);
  const { distributions } = state.api;
  return { linode, distributions };
}

export default connect(select)(AdvancedPage);
