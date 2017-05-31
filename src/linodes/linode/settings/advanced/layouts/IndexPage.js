import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { setError } from '~/actions/errors';
import { linodes, kernels, distributions } from '~/api';
import { getObjectByLabelLazily } from '~/api/util';

import { selectLinode } from '../../../utilities';


export class IndexPage extends Component {
  static async preload({ dispatch, getState }, { linodeLabel }) {
    const { id } = await dispatch(getObjectByLabelLazily('linodes', linodeLabel));

    try {
      const requests = [
        linodes.disks.all([id]),
        kernels.page(0),
      ];

      await Promise.all(requests.map(r => dispatch(r)));

      // Fetch distributions without waiting
      if (!getState().api.distributions.ids.length) {
        // Only needed from the add disk modal which isn't shown immediately.
        dispatch(distributions.all());
      }

      const { totalPages } = getState().api.kernels;

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
