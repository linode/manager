import React, { Component } from 'react';
import { Route, IndexRoute } from 'react-router';

import IndexPage from './layouts/IndexPage';
import LinodeDetailPage from './layouts/LinodeDetailPage';
import CreateLinodePage from './layouts/CreateLinodePage';

/* eslint-disable react/prop-types */
class Placeholder extends Component {
  constructor() {
    super();
    this.render = this.render.bind(this);
  }

  render() {
    const { pathname } = this.props.location;
    return <div>{pathname} placeholder</div>;
  }
}

export default (
  <Route path="/linodes">
    <IndexRoute component={IndexPage} />
    <Route path="create" component={CreateLinodePage} />
    <Route path=":linodeId" component={LinodeDetailPage}>
      <IndexRoute component={Placeholder} />
      <Route path="networking" component={Placeholder} />
      <Route path="resize" component={Placeholder} />
      <Route path="repair" component={Placeholder} />
      <Route path="backups" component={Placeholder} />
      <Route path="settings" component={Placeholder} />
    </Route>
  </Route>
);
