import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

import api from '~/api';
import { getObjectByLabelLazily } from '~/api/util';

import { selectLinode } from '../../../utilities';


export class IndexPage extends Component {
  static async preload({ dispatch, getState }, { linodeLabel }) {
    const { id } = await dispatch(getObjectByLabelLazily('linodes', linodeLabel));

    const requests = [
      api.linodes.disks.all([id]),
      api.linodes.volumes.all([id]),
      api.kernels.page(0),
      api.images.all(),
    ];

    await Promise.all(requests.map(r => dispatch(r)));

    const { totalPages } = getState().api.kernels;

    // Fetch rest of kernel pages without waiting.
    for (let i = 1; i < totalPages; i++) {
      dispatch(api.kernels.page(i));
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
