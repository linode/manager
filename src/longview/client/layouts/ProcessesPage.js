import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { setSource } from '~/actions/source';
import { selectLVClient } from '../utilities';
import { ComingSoon } from 'linode-components/errors';

const OBJECT_TYPE = 'lvclients';

export class ProcessesPage extends Component {
  async componentDidMount() {
    const { dispatch } = this.props;
    await dispatch(setSource(__filename));
  }

  render() {
    const classLink = `/longview/processes/${this.props.lvclient.label}`;
    return (
      <article className="container">
        <ComingSoon feature="Longview Processes" classicLink={classLink} />
      </article>
    );
  }
}

ProcessesPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  lvclient: PropTypes.object,
};


function select(state, props) {
  const { lvclient } = selectLVClient(state, props);

  return {
    lvclient,
    selectedMap: state.select.selected[OBJECT_TYPE] || {},
  };
}

export default connect(select)(ProcessesPage);
