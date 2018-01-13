import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';

import IndexPage from './layouts/IndexPage';
import ZonePage from './layouts/ZonePage';

const DomainsIndex = (props) => {
  const { match: { path } } = props;
  return (
    <Switch>
      <Route component={ZonePage} path={`${path}/:domainLabel`} />
      <Route component={IndexPage} exact path={`${path}/`} />
      <Redirect to="/not-found" />
    </Switch >
  );
};

DomainsIndex.propTypes = {
  match: PropTypes.shape({
    path: PropTypes.string.isRequired,
  }).isRequired,
};

export default DomainsIndex;


// import React from 'react';
// import { Route, IndexRoute } from 'react-router-dom';

// import IndexPage from './layouts/IndexPage';
// import ZonePage from './layouts/ZonePage';

// export default (
//   <Route path="/domains">
//     <IndexRoute component={IndexPage} />
//     <Route path=":domainLabel" component={ZonePage} />
//   </Route>
// );
