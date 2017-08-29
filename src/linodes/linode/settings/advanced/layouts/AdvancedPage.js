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
          <Configs {...this.props} selectedMap={this.props.configsSelectedMap} />
        </section>
        <section>
          <Disks {...this.props} selectedMap={this.props.disksSelectedMap} />
        </section>
        <Volumes {...this.props} selectedMap={this.props.volumesSelectedMap} />
      </div>
    );
  }
}

AdvancedPage.propTypes = {
  linode: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  distributions: PropTypes.object.isRequired,
  linodes: PropTypes.object.isRequired,
  configsSelectedMap: PropTypes.object.isRequired,
  volumesSelectedMap: PropTypes.object.isRequired,
  disksSelectedMap: PropTypes.object.isRequired,
};

function select(state, params) {
  const { linode } = selectLinode(state, params);
  const { distributions, linodes: { linodes } } = state.api;
  const volumesSelectedMap = state.select.selected[Volumes.OBJECT_TYPE] || {};
  const disksSelectedMap = state.select.selected[Disks.OBJECT_TYPE] || {};
  const configsSelectedMap = state.select.selected[Configs.OBJECT_TYPE] || {};
  return {
    linode,
    linodes,
    distributions,
    disksSelectedMap,
    volumesSelectedMap,
    configsSelectedMap,
  };
}

export default connect(select)(AdvancedPage);
