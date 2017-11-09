import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { setSource } from '~/actions/source';
import { selectLVClient } from '../utilities';
import { ComingSoon } from 'linode-components/errors';

const OBJECT_TYPE = 'lvclients';

export class NetworkPage extends Component {
  async componentDidMount() {
    const { dispatch } = this.props;
    await dispatch(setSource(__filename));
  }

  render() {
    return (
      <article className="container">
        <ComingSoon feature="Longview Networking" classicLink={`/longview/network/${this.props.lvclient.label}`} />
      </article>
    );
  }
}

NetworkPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  lvclient: PropTypes.object.isRequired,
  timeselect: PropTypes.string.isRequired,
};


function select(state, props) {
  const { lvclient } = selectLVClient(state, props);

  return {
    lvclient,
    selectedMap: state.select.selected[OBJECT_TYPE] || {},
  };
}

export default connect(select)(NetworkPage);
