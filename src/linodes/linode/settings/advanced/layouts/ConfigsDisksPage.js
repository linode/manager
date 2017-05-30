import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { setSource } from '~/actions/source';
import { setError } from '~/actions/errors';
import { distributions } from '~/api';

import { ConfigPanel } from '../components/ConfigPanel';
import { DiskPanel } from '../components/DiskPanel';
import { selectLinode } from '../../../utilities';


export class ConfigsDisksPage extends Component {
  static async preload({ dispatch, getState }) {
    try {
      if (!Object.values(getState().api.distributions).length) {
        await dispatch(distributions.all());
      }
    } catch (response) {
      dispatch(setError(response));
    }
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
  }

  render() {
    return (
      <div>
        <ConfigPanel {...this.props} />
        <DiskPanel {...this.props} />
      </div>
    );
  }
}

ConfigsDisksPage.propTypes = {
  linode: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  distributions: PropTypes.object.isRequired,
};

function select(state, params) {
  const { linode } = selectLinode(state, params);
  const { distributions } = state.api;
  return { linode, distributions };
}

export default connect(select)(ConfigsDisksPage);
