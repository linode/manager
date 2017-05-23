import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { setError } from '~/actions/errors';
import { setSource } from '~/actions/source';
import { linodes } from '~/api';
import { getObjectByLabelLazily } from '~/api/util';

import { ConfigPanel } from '../components/ConfigPanel';
import { DiskPanel } from '../components/DiskPanel';
import { selectLinode } from '../../utilities';


export class AdvancedPage extends Component {
  static async preload({ dispatch, getState }, { linodeLabel }) {
    const { id } = await dispatch(getObjectByLabelLazily('linodes', linodeLabel));

    try {
      await dispatch(linodes.disks.all([id]));
      const { total_pages } = await dispatch(kernels.page(0));

      // Fetch rest of things without waiting.
      for (let i = 1; i < total_pages; i++) {
        dispatch(kernels.page(i));
      }
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
  dispatch: PropTypes.func.isRequired,
  distributions: PropTypes.object.isRequired,
};

function select(state, params) {
  const { linode } = selectLinode(state, params);
  const { distributions } = state.api;
  return { linode, distributions };
}

export default connect(select)(AdvancedPage);
