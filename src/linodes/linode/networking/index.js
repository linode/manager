import React from 'react';
import { Route, IndexRoute } from 'react-router';

import {
  IndexPage,
  SummaryPage,
  ReverseDNSPage,
} from './layouts';

export default (
  <Route path="networking" component={IndexPage}>
    <IndexRoute component={SummaryPage} />
    <Route path="reversedns" component={ReverseDNSPage} />
    <Route path="ipmanagement" component={() => <span>Todo</span>} />
  </Route>
);
