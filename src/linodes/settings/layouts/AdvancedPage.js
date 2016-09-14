import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { ConfigPanel } from '~/linodes/settings/components/ConfigPanel';
import { DiskPanel } from '~/linodes/settings/components/DiskPanel';

export function AdvancedPage(props) {
  return (
    <div className="form-group">
      <div className="content-col form-group">
        <span className="text-danger">WARNING! </span>
        This section is intended for advanced users. Proceed with caution.
      </div>
      <ConfigPanel {...props} />
      <hr />
      <DiskPanel {...props} />
    </div>
  );
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
