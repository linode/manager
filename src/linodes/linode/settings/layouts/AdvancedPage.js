import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { setSource } from '~/actions/source';
import { linodes } from '~/api';

import { ConfigPanel } from '../components/ConfigPanel';
import { DiskPanel } from '../components/DiskPanel';
import { selectLinode } from '../../utilities';


export class AdvancedPage extends Component {
    static async preload({ dispatch, getState }, { linodeLabel }) {
    const { id } = Object.values(getState().api.linodes.linodes).reduce(
      (match, linode) => linode.label === linodeLabel ? linode : match);

    try {
      await dispatch(linodes.disks.all([id]));
    } catch (e) {
      dispatch(setError(e));
    }
    }

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
  distributions: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
};

function select(state) {
  const { linode } = selectLinode(state);
  const { distributions } = state.api;
  return { linode, distributions };
}

export default connect(select)(AdvancedPage);
