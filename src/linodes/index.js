import React from 'react';
import { Switch, Route } from 'react-router-dom';
import PropTypes from 'prop-types';
import IndexPage from '~/linodes/layouts/IndexPage';
import LinodeIndex from './linode/index';
import NotFound from 'linode-components/dist/errors/NotFound';

const LinodesIndex = (props) => {
  const { match: { path } } = props;
  return (
    <Switch>
      <Route component={LinodeIndex} path={`${path}/:linodeLabel`} />
      <Route component={IndexPage} exact path={`${path}/`} />
      <Route component={NotFound} />
    </Switch>
  );
};

LinodesIndex.propTypes = {
  match: PropTypes.shape({
    path: PropTypes.string.isRequired,
  }).isRequired,
};

export default LinodesIndex;


/**
 * /lindoes
 *
 * - /:label (dashboard)d
 *
 * - - /networking (summary)
 * - - - /transfer
 * - - - /sharing
 * - - - /resolvers
 *
 * - - /rebuild (index)
 *
 * - - /resize (index)
 *
 * - - /rescue (index)
 *
 * - - /backups (summary)
 * - - - /settings
 *
 * - - /settings (display)
 * - - - /alerts
 * - - - /advanced
 */
