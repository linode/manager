import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import api from '~/api';
import { getObjectByLabelLazily } from '~/api/util';
import { selectLinode } from '../../../utilities';
import { ComponentPreload as Preload } from '~/decorators/Preload';


export class IndexPage extends Component {
  componentDidMount() {
    const { totalPages } = this.props.kernels;

    // Fetch rest of kernel pages without waiting.
    for (let i = 1; i < totalPages; i++) {
      this.props.dispatch(api.kernels.page(i));
    }
  }

  render() {
    return this.props.children;
  }
}

IndexPage.propTypes = {
  children: PropTypes.node.isRequired,
  dispatch: PropTypes.func.isRequired,
  kernels: PropTypes.object.isRequired,
};

const mapStateToProps = (state, props) => {
  const { linodes } = selectLinode(state, props);
  return {
    linodes,
    kernels: state.api.kernels,
  };
};

export default compose(
  connect(mapStateToProps),
  Preload(
    async function (dispatch, { params: { linodeLabel } }) {
      const { id } = await dispatch(getObjectByLabelLazily('linodes', linodeLabel));

      const requests = [
        api.linodes.disks.all([id]),
        api.linodes.volumes.all([id]),
        api.kernels.page(0),
        api.images.all(),
      ];

      await Promise.all(requests.map(r => dispatch(r)));
    }
  )
)(IndexPage);
