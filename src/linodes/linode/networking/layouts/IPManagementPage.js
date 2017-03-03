import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import { IPTransfer, IPSharing } from '../components';

export function IPManagementPage(props) {
  const { linodes, dispatch, params: { linodeLabel } } = props;

  const linode = Object.values(linodes.linodes).reduce(
      (match, linode) => linode.label === linodeLabel ? linode : match);

  return (
    <div>
      <IPTransfer
        dispatch={dispatch}
        linode={linode}
      />
      <IPSharing
        dispatch={dispatch}
        linode={linode}
      />
    </div>
  );
}


IPManagementPage.propTypes = {
  linodes: PropTypes.object,
  dispatch: PropTypes.func.isRequired,
  params: PropTypes.shape({
    linodeLabel: PropTypes.string.isRequired,
  }).isRequired,
};

function select(state) {
  return { linodes: state.api.linodes };
}

export default connect(select)(IPManagementPage);
