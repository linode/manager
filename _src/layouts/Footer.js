import React from 'react';
import { connect } from 'react-redux';
import ExternalLink from 'linode-components/dist/buttons/ExternalLink';
import PropTypes from 'prop-types';

import { VERSION } from '~/constants';

const Footer = ({ source }) => (
  <footer className="Footer text-center">
    <div className="container">
      <span>Version {VERSION}</span>
    </div>

    {source && source.source && (
      <ExternalLink
        to={`https://github.com/linode/manager/blob/${VERSION ? `v${VERSION}` : 'master'}/${source.source}`}
      >Page Source</ExternalLink>
    )}
  </footer>
);

Footer.propTypes = {
  source: PropTypes.string,
};

const mapStateToProps = (state) => ({
  source: state.source.source,
});

export default connect(mapStateToProps)(Footer);
