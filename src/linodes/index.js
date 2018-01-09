import React from 'react';
import { Route, Switch } from 'react-router-dom';
import PropTypes from 'prop-types';
import Layout from '../layouts/Layout';
import IndexPage from '~/linodes/layouts/IndexPage';
import LinodeIndex from './linode/index';
import LinodeLayout from './linode/layouts/IndexPage.js';
const LinodesIndex = ({ match: { url } }) => {
  console.log('LinodesIndex:render');
  return (
    <Switch>
      <LinodeLayout path={`${url}/:linodeLabel`} component={LinodeIndex} />
      <Layout exact path={url} component={IndexPage} />
    </Switch>
  );
};

LinodesIndex.propTypes = {
  match: PropTypes.shape({
    url: PropTypes.string.isRequired,
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
