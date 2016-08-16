import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { getLinode, loadLinode } from '~/linodes/layouts/LinodeDetailPage';

export class AdvancedPage extends Component {
  constructor() {
    super();
    this.getLinode = getLinode.bind(this);
    this.loadLinode = loadLinode.bind(this);
  }

  render() {
    const profileModule = '[Profile Module Here]';
    const diskModule = '[Disk Module Here]';
    return (
      <div>
        <div className="content-col">
          <span className="text-danger">WARNING! </span>
          Changes to this section can force Linode to skip some usability optimizations.
        </div>
        {profileModule}
        <hr />
        {diskModule}
      </div >
    );
  }
}

AdvancedPage.propTypes = {
  linodes: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
};

function select(state) {
  return { linodes: state.api.linodes };
}

export default connect(select)(AdvancedPage);

