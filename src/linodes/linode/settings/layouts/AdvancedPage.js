import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { ConfigPanel } from '~/linodes/linode/settings/components/ConfigPanel';
import { DiskPanel } from '~/linodes/linode/settings/components/DiskPanel';
import { setSource } from '~/actions/source';

export class AdvancedPage extends Component {
  static async preload(dispatch, params) {
    await ConfigPanel.preload(dispatch, params);
    await DiskPanel.preload(dispatch, params);
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
  dispatch: PropTypes.func.isRequired,
  params: PropTypes.shape({
    linodeId: PropTypes.string,
  }),
};

function select(state) {
  return { linodes: state.api.linodes };
}

export default connect(select)(AdvancedPage);
