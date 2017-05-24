import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { setError } from '~/actions/errors';
import { linodes, kernels } from '~/api';
import { getObjectByLabelLazily } from '~/api/util';

import { selectLinode } from '../../../utilities';


export class IndexPage extends Component {
  static async preload({ dispatch, getState }, { linodeLabel }) {
    const { id } = await dispatch(getObjectByLabelLazily('linodes', linodeLabel));

    try {
      await dispatch(linodes.disks.all([id]));
      const { total_pages: totalPages } = await dispatch(kernels.page(0));

      // Fetch rest of kernel pages without waiting.
      for (let i = 1; i < totalPages; i++) {
        dispatch(kernels.page(i));
      }
    } catch (e) {
      dispatch(setError(e));
    }
  }

  render() {
    return this.props.children;
  }
}

IndexPage.propTypes = {
  children: PropTypes.node.isRequired,
};

export default connect(selectLinode)(IndexPage);
