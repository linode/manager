import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { setSource } from '~/actions/source';

import { Configs, Disks, Volumes } from '../components';
import { selectLinode } from '../../../utilities';


export class AdvancedPage extends Component {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
  }

  render() {
    return (
      <div>
        <section>
          <Configs {...this.props} />
        </section>
        <section>
          <Disks {...this.props} />
        </section>
        <Volumes {...this.props} />
      </div>
    );
  }
}

AdvancedPage.propTypes = {
  linode: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  distributions: PropTypes.object.isRequired,
};

function select(state, params) {
  const { linode } = selectLinode(state, params);
  const { distributions } = state.api;
  return { linode, distributions };
}

export default connect(select)(AdvancedPage);
