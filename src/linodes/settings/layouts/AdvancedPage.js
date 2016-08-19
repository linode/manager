import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import HelpButton from '~/components/HelpButton';
import ConfigPanel from '~/linodes/settings/components/ConfigPanel';

export function AdvancedPage(props) {
  const diskModule = (<h3>Disks<HelpButton to="http://example.org" /></h3>);
  return (
    <div>
      <div className="content-col">
        <span className="text-danger">WARNING! </span>
        This section is intended for advanced users. Proceed with caution.
      </div>
      <ConfigPanel params={props.params} />
      <hr />
      {diskModule}
      TODO
    </div >
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
