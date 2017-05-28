import _ from 'lodash';
import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';

import { setError } from '~/actions/errors';
import { linodes } from '~/api';
import { ipv6s, ipv4s } from '~/api/networking';
import { getObjectByLabelLazily } from '~/api/util';

import { IPTransfer, IPSharing } from '../components';
import { selectLinode } from '../../utilities';


export class IPManagementPage extends Component {
  static async preload({ dispatch, getState }, { linodeLabel }) {
    try {
      const { region } = await dispatch(getObjectByLabelLazily('linodes', linodeLabel));
      // TODO: filtering by region doesn't work?
      await dispatch(linodes.all([], undefined));
      await dispatch(ipv4s(region));
      await dispatch(ipv6s(region));
    } catch (e) {
      dispatch(setError(e));
    }
  }

  render() {
    const { linodes, dispatch, linode } = this.props;

    // Although we only explicitly looked up all linodes in the current dc,
    // other linodes may already exist in the state.
    const linodesInRegion = _.pickBy(linodes, l =>
      l.region.id === linode.region.id);

    return (
      <div>
        <IPTransfer
          dispatch={dispatch}
          linode={linode}
          linodes={linodesInRegion}
        />
        <IPSharing
          dispatch={dispatch}
          linode={linode}
          linodes={Object.values(linodesInRegion)}
        />
      </div>
    );
  }
}


IPManagementPage.propTypes = {
  linodes: PropTypes.object.isRequired,
  linode: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
};

function select(state, props) {
  const { linode } = selectLinode(state, props);
  const { linodes } = state.api.linodes;
  return { linode, linodes };
}

export default connect(select)(IPManagementPage);
