import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { ConfigPanel } from '~/linodes/linode/settings/components/ConfigPanel';
import { DiskPanel } from '~/linodes/linode/settings/components/DiskPanel';
import { setSource } from '~/actions/source';

export class AdvancedPage extends Component {
  static async preload(store, params) {
    await ConfigPanel.preload(store, params);
    await DiskPanel.preload(store, params);
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
  }

  render() {
    return (
      <div>
        <section className="card">
          <ConfigPanel {...this.props} />
        </section>
        <section className="card">
          <DiskPanel {...this.props} />
        </section>
      </div>
    );
  }
}

AdvancedPage.propTypes = {
  linodes: PropTypes.object.isRequired,
  distributions: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  params: PropTypes.shape({
    linodeLabel: PropTypes.string,
  }),
};

function select(state) {
  return {
    linodes: state.api.linodes,
    distributions: state.api.distributions,
  };
}

export default connect(select)(AdvancedPage);
