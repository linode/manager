import _ from 'lodash';
import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';

import { linodes } from '~/api';
import { ipv4s } from '~/api/networking';
import { createHeaderFilter, getObjectByLabelLazily } from '~/api/util';

import { IPTransfer, IPSharing } from '../components';
import { selectLinode } from '../../utilities';


export class IPManagementPage extends Component {
  static async preload({ dispatch, getState }, { linodeLabel }) {
    const { region } = await dispatch(getObjectByLabelLazily('linodes', linodeLabel));
    await dispatch(linodes.all([], undefined, createHeaderFilter({ region: region.id })));
    await dispatch(ipv4s(region));
  }

  render() {
    const { linodes, dispatch, linode } = this.props;

    // Although we only explicitly looked up all linodes in the current dc,
    // other linodes may already exist in the state.
    const linodesInRegion = _.pickBy(linodes, l =>
      l.region.id === linode.region.id);

    return (
      <div>
        <section>
          <IPTransfer
            dispatch={dispatch}
            linode={linode}
            linodes={linodesInRegion}
          />
        </section>
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
