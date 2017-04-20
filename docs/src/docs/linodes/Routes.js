import React from 'react';
import { Route, IndexRedirect } from 'react-router';

import Instances from './Instances';


export default (
  <Route path="linodes">
    <IndexRedirect to="instances" />
    <Route path="instances" component={Instances} />
  </Route>
);
