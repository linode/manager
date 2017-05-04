import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { selectLinode } from '../../utilities';
import { ConfigPanel } from '~/linodes/linode/settings/components/ConfigPanel';
import { DiskPanel } from '~/linodes/linode/settings/components/DiskPanel';
import { setSource } from '~/actions/source';

export class AdvancedPage extends Component {
  static async preload(store, params) {
    await DiskPanel.preload(store, params);
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

AdvancedPage.propTypes = {
  linode: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default connect(selectLinode)(AdvancedPage);
