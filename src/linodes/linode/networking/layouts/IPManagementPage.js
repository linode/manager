import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';

import { IPTransfer, IPSharing } from '../components';
import { setError } from '~/actions/errors';
import { linodes } from '~/api';
import { linodeIPs } from '~/api/linodes';

export class IPManagementPage extends Component {
  // TODO: this needs to be replaced with fetching all ips and filtering by dc
  static async preload({ dispatch, getState }, { linodeLabel }) {
    const linode = Object.values(getState().api.linodes.linodes).reduce(
      (match, linode) => linode.label === linodeLabel ? linode : match);

    try {
      const allLinodes = await dispatch(linodes.all([], undefined, {
        headers: {
          'X-Filter': { datacenter: linode.datacenter },
        },
      }));

      for (const linode of Object.values(allLinodes.linodes)) {
        await dispatch(linodeIPs(linode.id));
      }
    } catch (e) {
      dispatch(setError(e));
    }
  }

  render() {
    const { linodes, dispatch, params: { linodeLabel } } = this.props;

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
          linodes={linodes}
        />
      </div>
    );
  }
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
